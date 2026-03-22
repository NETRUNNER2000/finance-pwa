'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import { useSettings } from '../context/SettingsContext'
import { useRouter } from 'next/router'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import Page from '@/components/page'

interface CategoryTotal {
  category: string
  total: number
  transaction_type: 'income' | 'expense'
}

export default function Dashboard() {

  const { memoUser, setUser, selectedAccount, setSelectedAccount, sharedAccounts } = useUser()
  const {settings, updateSettings} = useSettings()
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  
  const router = useRouter()
  const sankeyRef = useRef<SVGSVGElement | null>(null)

  const fetchCategoryTotals = useCallback(async (userId: string) => {
    if (!userId) return

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const { data, error } = await supabase.rpc('get_category_totals_by_paymonth', {
      p_user_id: userId,
      p_year: year,
      p_month: month,
      p_payday: settings.payday
    })

    if (error) console.error(error)
    else setCategoryTotals(data || [])
  }, [settings.payday])

  useEffect(() => {
    if (!selectedAccount) return
    fetchCategoryTotals(selectedAccount)
  }, [selectedAccount, fetchCategoryTotals])

  useEffect(() => {
    if (!sankeyRef.current) return

    const svg = d3.select(sankeyRef.current)
    svg.selectAll('*').remove()

    const layoutWidth = 600
    const layoutHeight = 400
    const margin = { top: 20, right: 140, bottom: 20, left: 20 }

    const grossIncome = settings.grossIncome
    const tax = 5300
    const uif = 177
    const pension = 582
    const netIncome = grossIncome - tax - uif - pension

    // Split categoryTotals
    const expenseSums: Record<string, number> = {}
    const incomeSums: Record<string, number> = {}
    categoryTotals.forEach(c => {
      if (c.transaction_type === 'expense') expenseSums[c.category] = (expenseSums[c.category] || 0) + c.total
      if (c.transaction_type === 'income') incomeSums[c.category] = (incomeSums[c.category] || 0) + c.total
    })

    const expenseCategories = Object.keys(expenseSums)
    const incomeCategories = Object.keys(incomeSums)
    const spentTotal = Object.values(expenseSums).reduce((a, b) => a + b, 0)
    const incomeTotal = Object.values(incomeSums).reduce((a,b)=>a+b,0)
    const remaining = Math.max(netIncome + incomeTotal - spentTotal, 0)

    const categoryColor = d3.scaleOrdinal<string>()
      .domain([...expenseCategories, ...incomeCategories])
      .range(d3.schemeTableau10)

    // Nodes
    const nodes = [
      { name: 'Gross [Gross Income]' },       // 0
      { name: `Tax [${tax}]` },               // 1
      { name: `UIF [${uif}]` },               // 2
      { name: `Pension [${pension}]` },       // 3
      { name: `Net [${netIncome}]` },         // 4
      ...incomeCategories.map(c => ({ name: `${c} [${incomeSums[c]}]` })),  // 5..n
      ...expenseCategories.map(c => ({ name: `${c} [${expenseSums[c]}]` })), // last-1
      { name: `Remaining [${remaining}]` }   // last
    ]

    // Indices
    const grossIndex = 0
    const taxIndex = 1
    const uifIndex = 2
    const pensionIndex = 3
    const netIndex = 4
    const incomeStartIndex = 5
    const expenseStartIndex = incomeStartIndex + incomeCategories.length
    const remainingIndex = nodes.length - 1

    const links = []

    // Gross → Deductions
    links.push({ source: grossIndex, target: taxIndex, value: tax })
    links.push({ source: grossIndex, target: uifIndex, value: uif })
    links.push({ source: grossIndex, target: pensionIndex, value: pension })
    links.push({ source: grossIndex, target: netIndex, value: netIncome })

    // Income categories → Net
    incomeCategories.forEach((c,i)=>{
      links.push({ source: incomeStartIndex + i, target: netIndex, value: incomeSums[c] })
    })

    // Net → Expenses
    expenseCategories.forEach((c,i)=>{
      links.push({ source: netIndex, target: expenseStartIndex + i, value: expenseSums[c] })
    })

    // Net → Remaining
    links.push({ source: netIndex, target: remainingIndex, value: remaining })

    interface SankeyNode { name: string; x0?: number; x1?: number; y0?: number; y1?: number }
    interface SankeyLink { source: number; target: number; value: number; width?: number }

    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[0, 0], [layoutWidth, layoutHeight]])

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links))
    })

    svg
      .attr('viewBox', `0 0 ${layoutWidth + margin.right} ${layoutHeight + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', 'transparent')

    const g = svg.append('g').attr('transform', `translate(0, ${margin.top})`)

    // Links
    g.append('g')
      .selectAll('path')
      .data(sankeyLinks)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        const name = (d.target as SankeyNode).name
        if (name.startsWith('Tax')) return '#ef4444'
        if (name.startsWith('UIF')) return '#fbbf24'
        if (name.startsWith('Pension')) return '#f97316'
        if (name.startsWith('Remaining')) return '#22c55e'
        if (incomeCategories.some(c=>name.startsWith(c))) return '#10b981'
        const categoryName = name.split(' [')[0]
        return categoryColor(categoryName)
      })
      .attr('stroke-width', d=>Math.max(1,d.width||1))
      .attr('fill','none')
      .attr('opacity',0.5)

    // Nodes
    g.append('g')
      .selectAll('rect')
      .data(sankeyNodes)
      .join('rect')
      .attr('x', d => d.x0 || 0)
      .attr('y', d => d.y0 || 0)
      .attr('height', d => (d.y1||0)-(d.y0||0))
      .attr('width', d => (d.x1||0)-(d.x0||0))
      .attr('fill', d=>{
        if (d.name.startsWith('Gross')) return '#f59e0b'
        if (d.name.startsWith('Net')) return '#6366f1'
        if (d.name.startsWith('Remaining')) return '#22c55e'
        if (d.name.startsWith('Tax')) return '#ef4444'
        if (d.name.startsWith('UIF')) return '#fbbf24'
        if (d.name.startsWith('Pension')) return '#f97316'
        if (incomeCategories.some(c=>d.name.startsWith(c))) return '#10b981'
        const categoryName = d.name.split(' [')[0]
        return categoryColor(categoryName)
      })

    // Node labels
    g.append('g')
      .selectAll('text')
      .data(sankeyNodes)
      .join('text')
      .attr('x', d=>(d.x1||0)+6)
      .attr('y', d=>((d.y1||0)+(d.y0||0))/2)
      .attr('alignment-baseline','middle')
      .text(d=>d.name)
      .attr('fill','#ffffff')
      .style('font-size','12px')

  }, [categoryTotals])

  const lineChartRef = useRef<SVGSVGElement | null>(null)
  useEffect(() => {
    if (!lineChartRef.current) return
    const svg = d3.select(lineChartRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 220
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const months = ['Oct','Nov','Dec','Jan','Feb','Mar']
    const dataset = [
      { name: "Food", values: [1200,1500,900,1800,1700,2000] },
      { name: "Transport", values: [600,800,700,900,850,1000] },
      { name: "Entertainment", values: [400,500,450,600,650,700] }
    ]
    const x = d3.scalePoint().domain(months).range([margin.left, width - margin.right])
    const y = d3.scaleLinear().domain([0, d3.max(dataset.flatMap(d => d.values))!]).nice().range([height - margin.bottom, margin.top])
    const color = d3.scaleOrdinal<string>().domain(dataset.map(d => d.name)).range(["#6366f1","#22c55e","#f59e0b"])
    const line = d3.line<number>().x((d,i) => x(months[i])!).y(d => y(d)).curve(d3.curveMonotoneX)
    const area = d3.area<number>().x((d,i) => x(months[i])!).y0(height-margin.bottom).y1(d=>y(d)).curve(d3.curveMonotoneX)
    dataset.forEach(series=>{svg.append("path").datum(series.values).attr("fill",color(series.name) as string).attr("opacity",0.2).attr("d",area)})
    dataset.forEach(series=>{svg.append("path").datum(series.values).attr("fill","none").attr("stroke",color(series.name) as string).attr("stroke-width",2).attr("d",line)})
    svg.append("g").attr("transform",`translate(0,${height-margin.bottom})`).call(d3.axisBottom(x))
    svg.append("g").attr("transform",`translate(${margin.left},0)`).call(d3.axisLeft(y))
    svg.attr("viewBox",`0 0 ${width} ${height}`).style("width","100%").style("height","auto")
  }, [])

  return (
    <Page title="Dashboard">
      <div className="bg-gray-100 p-4 test">
        <div className="max-w-4xl bg-gray-100 mx-auto test">
          <div className="sankey-container h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4 flex-none">Transactions Sankey</h2>
            <svg ref={sankeyRef} className="flex-1 w-full"></svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        .test{ background-color: #f9f9fb00 !important; height: auto; }
        .sankey-container { width: 100%; overflow-x: auto; margin-left: 0px; overflow: hidden; }
        .sankey-container svg { width: 100%; transform-origin: top left; transform: scale(1); }
        @media (max-width: 640px) { .sankey-container svg { margin-bottom: 60px; transform: scale(1.05); } }
      `}</style>

      <div className="linechart-container mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Dummy Line Chart</h2>
        <svg ref={lineChartRef}></svg>
      </div>
    </Page>
  )
}