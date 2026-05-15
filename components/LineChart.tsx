import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useSettings } from '../context/SettingsContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

interface LastMonthData {
  category: string
  total: number
  month_start: string
}

interface LineChartProps {
  last12Months: LastMonthData[]
}

export default function LineChart({ last12Months }: LineChartProps) {
  const lineChartRef = useRef<SVGSVGElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const setShowModalRef = useRef<(v: boolean) => void>(() => {})
  const [showModal, setShowModal] = useState(false)
  const { localSettings, updateLocalSettings } = useSettings()   
  const MONTHS_TO_SHOW = localSettings.lineChartMonthsToDisplay ?? 4

  useEffect(() => {
    setShowModalRef.current = setShowModal
    
  }, [])

  useEffect(() => {
    console.log("Local settings in LineChart:", localSettings)
  }, [localSettings])

  const allCategories = Array.from(new Set(last12Months.map(d => d.category)))
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (allCategories.length === 0) return

    const saved = localSettings.visibleLineChartCategories
    if (saved.size > 0) {
      const savedArray = Array.from(saved) as string[]
      const valid = new Set<string>(savedArray.filter(cat => allCategories.includes(cat)))
      setVisibleCategories(valid.size > 0 ? valid : new Set(allCategories))
    } else {
      setVisibleCategories(new Set(allCategories))
    }
  }, [allCategories.length])

  const setMonthsToShow = (value: number) => {
    const clamped = Math.max(1, Math.min(24, value))
    updateLocalSettings({ lineChartMonthsToDisplay: clamped })
  }

  const toggleCategory = (category: string) => {
    const next = new Set(visibleCategories)
    next.has(category) ? next.delete(category) : next.add(category)
    setVisibleCategories(next)
    updateLocalSettings({ visibleLineChartCategories: next })
  }

  const toggleAll = (checked: boolean) => {
    const next = checked ? new Set(allCategories) : new Set<string>()
    setVisibleCategories(next)
    updateLocalSettings({ visibleLineChartCategories: next })
  }

  useEffect(() => {
    if (!lineChartRef.current || last12Months.length === 0) return

    const svg = d3.select(lineChartRef.current)
    svg.selectAll('*').remove()

    svg.style('pointer-events', 'all')

    const width = 600
    const height = 220
    const margin = { top: 20, right: 140, bottom: 30, left: 40 }
    const legendWidth = 120

    const monthDates = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (MONTHS_TO_SHOW - 1 - i))
      d.setDate(1)
      return d
    })

    const monthNames = monthDates.map(d => d3.timeFormat('%b')(d))
    const categories = Array.from(new Set(last12Months.map(d => d.category)))

    const dataset = categories.map(cat => {
      const values = monthDates.map(d => {
        const match = last12Months.filter(
          item =>
            item.category === cat &&
            new Date(item.month_start).getFullYear() === d.getFullYear() &&
            new Date(item.month_start).getMonth() === d.getMonth()
        )
        return match.reduce((sum, i) => sum + Number(i.total), 0)
      })
      return { name: cat, values }
    })

    const filtered = dataset.filter(d => visibleCategories.has(d.name))

    const x = d3.scalePoint()
      .domain(monthNames)
      .range([margin.left, width - margin.right - legendWidth])

    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered.flatMap(d => d.values)) || 0])
      .nice()
      .range([height - margin.bottom, margin.top])

    const color = d3.scaleOrdinal<string>()
      .domain(categories)
      .range(d3.schemeTableau10)

    const line = d3.line<number>()
      .x((d, i) => x(monthNames[i])!)
      .y(d => y(d))
      .curve(d3.curveMonotoneX)

    // --------------------
    // LINES
    // --------------------
    filtered.forEach(series => {
      svg.append('path')
        .datum(series.values)
        .attr('fill', 'none')
        .attr('stroke', color(series.name)!)
        .attr('stroke-width', 2)
        .attr('d', line)
    })

    // --------------------
    // POINTS (FIXED HOVER)
    // --------------------
    const pointsLayer = svg.append('g').attr('class', 'points')

    filtered.forEach(series => {
      pointsLayer
        .selectAll(null)
        .data(series.values.map((v, i) => ({ v, i })))
        .enter()
        .append('circle')
        .attr('cx', d => x(monthNames[d.i])!)
        .attr('cy', d => y(d.v))
        .attr('r', 4)
        .attr('fill', color(series.name)!)
        .style('cursor', 'pointer')
        .style('pointer-events', 'all')
        .on('mousemove', (event, d) => {
          if (!tooltipRef.current) return

          tooltipRef.current.style.opacity = '1'
          tooltipRef.current.style.left = `${event.clientX + 10}px`
          tooltipRef.current.style.top = `${event.clientY + 10}px`
          tooltipRef.current.innerHTML = `
            <div><b>${series.name}</b></div>
            <div>Value: ${d.v}</div>
          `
        })
        .on('mouseout', () => {
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '0'
          }
        })
    })

    // --------------------
    // AXES
    // --------------------
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    // --------------------
    // LEGEND (CLICKABLE)
    // --------------------
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`)
      .style('cursor', 'pointer')

      .on('click', () => {
        setShowModalRef.current(true)
      })

    dataset.forEach((series, i) => {
      const row = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`)

      row.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(series.name)!)

      row.append('text')
        .attr('x', 16)
        .attr('y', 12)
        .style('font-size', '12px')
        .style('fill', '#fff')
        .text(series.name)
    })

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')

  }, [last12Months, visibleCategories, MONTHS_TO_SHOW])

  return (
    <>
      <div className="relative inline-block w-full">
        <svg ref={lineChartRef}></svg>

<div
  ref={tooltipRef}
  className="fixed pointer-events-none bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50 opacity-0"
  style={{ transition: 'opacity 0.1s ease' }}
/>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
  onClick={() => setMonthsToShow(MONTHS_TO_SHOW - 1)}
>
  −
</button>
<span>
  {MONTHS_TO_SHOW} months
</span>
<button
  onClick={() => setMonthsToShow(MONTHS_TO_SHOW + 1)}
>
  +
</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Select Categories to Display</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleCategories.size === allCategories.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                  Select All
                </label>

                <div className="border-t pt-3 space-y-2">
                  {allCategories.sort().map(cat => (
                    <label key={cat} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={visibleCategories.has(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={() => setShowModal(false)} className="w-full">
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 