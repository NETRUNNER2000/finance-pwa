import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface InvestmentProjectionChartProps {
  initialAmount?: number
  monthlyContribution?: number
  monthlyRate?: number
  months?: number
}

export default function InvestmentProjectionChart({
  initialAmount = 10000,
  monthlyContribution = 500,
  monthlyRate = 0.005, // 0.5% monthly (6% annual)
  months = 6
}: InvestmentProjectionChartProps) {
  const chartRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Generate projection data with monthly contributions
    const projectionData = Array.from({ length: months + 1 }, (_, i) => {
      let balance = initialAmount
      let totalContributions = initialAmount

      // Apply monthly interest and contributions for each month
      for (let month = 1; month <= i; month++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution
        totalContributions += monthlyContribution
      }

      const interest = balance - totalContributions

      return {
        month: i,
        balance: Math.round(balance * 100) / 100,
        contributions: Math.round(totalContributions * 100) / 100,
        interest: Math.round(interest * 100) / 100
      }
    })

    const svg = d3.select(chartRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 300
    const margin = { top: 20, right: 40, bottom: 30, left: 60 }

    // Get month labels
    const today = new Date()
    const monthLabels = projectionData.map((_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      return d3.timeFormat('%b')(d)
    })

    // Scales
    const x = d3.scalePoint()
      .domain(monthLabels)
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([initialAmount * 0.9, d3.max(projectionData, d => d.balance)!])
      .nice()
      .range([height - margin.bottom, margin.top])

    // Line generator for balance
    const line = d3.line<(typeof projectionData)[0]>()
      .x((d, i) => x(monthLabels[i])!)
      .y(d => y(d.balance))
      .curve(d3.curveMonotoneX)

    // Line generator for contributions
    const contributionLine = d3.line<(typeof projectionData)[0]>()
      .x((d, i) => x(monthLabels[i])!)
      .y(d => y(d.contributions))
      .curve(d3.curveMonotoneX)

    // Draw balance line (green)
    svg
      .append('path')
      .datum(projectionData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2.5)
      .attr('d', line)

    // Draw contributions line (blue, dashed)
    svg
      .append('path')
      .datum(projectionData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', contributionLine)

    // Draw balance dots
    svg
      .selectAll('.dot-balance')
      .data(projectionData)
      .enter()
      .append('circle')
      .attr('class', 'dot-balance')
      .attr('cx', (d, i) => x(monthLabels[i])!)
      .attr('cy', d => y(d.balance))
      .attr('r', 4)
      .attr('fill', '#10b981')
      .attr('opacity', 0.7)

    // Draw contributions dots
    svg
      .selectAll('.dot-contributions')
      .data(projectionData)
      .enter()
      .append('circle')
      .attr('class', 'dot-contributions')
      .attr('cx', (d, i) => x(monthLabels[i])!)
      .attr('cy', d => y(d.contributions))
      .attr('r', 3)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.7)

    // X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('fill', '#ffffff')
      .style('font-size', '12px')
      .text('Month')

    // Y axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('fill', '#ffffff')
      .style('font-size', '12px')
      .text('Balance ($)')

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat(() => '')
      )
      .style('stroke-opacity', 0.1)

    // Format Y axis labels as currency
    svg.selectAll('.tick text').attr('fill', '#ffffff').style('font-size', '11px')

    svg.attr('viewBox', `0 0 ${width} ${height}`).style('width', '100%').style('height', 'auto')

  }, [initialAmount, monthlyContribution, monthlyRate, months])

  // Calculate final values
  const projectionData = Array.from({ length: months + 1 }, (_, i) => {
    let balance = initialAmount
    let totalContributions = initialAmount

    for (let month = 1; month <= i; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution
      totalContributions += monthlyContribution
    }

    const interest = balance - totalContributions

    return {
      month: i,
      balance: Math.round(balance * 100) / 100,
      contributions: Math.round(totalContributions * 100) / 100,
      interest: Math.round(interest * 100) / 100
    }
  })

  const finalData = projectionData[months]
  const totalInterest = finalData.interest

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground truncate">Monthly</p>
          <p className="text-sm font-semibold text-white">R{monthlyContribution.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground truncate">Total In</p>
          <p className="text-sm font-semibold text-blue-400">R{finalData.contributions.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground truncate">Interest</p>
          <p className="text-sm font-semibold text-green-400">R{totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground truncate">Total Out</p>
          <p className="text-sm font-semibold text-white">R{finalData.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <svg ref={chartRef}></svg>
    </div>
  )
}

