import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useSettings } from '../context/SettingsContext'

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
  const [showModal, setShowModal] = useState(false)
  const setShowModalRef = useRef(setShowModal)
  const { localSettings, updateLocalSettings } = useSettings()

  useEffect(() => {
    setShowModalRef.current = setShowModal
  }, [setShowModal])
  
  // Extract all categories from data
  const allCategories = Array.from(new Set(last12Months.map(d => d.category)))
  
  // Initialize visible categories from local settings or default to all
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set())
  
  // Load from local settings on mount
  useEffect(() => {
    if (allCategories.length === 0) return
    
    const saved = localSettings.visibleLineChartCategories
    if (saved.size > 0) {
      // Filter to only categories that exist in current data
      const savedArray = Array.from(saved) as string[]
      const valid = new Set<string>(savedArray.filter(cat => allCategories.includes(cat)))
      setVisibleCategories(valid.size > 0 ? valid : new Set<string>(allCategories))
    } else {
      setVisibleCategories(new Set<string>(allCategories))
    }
  }, [allCategories.length])

  const toggleCategory = (category: string) => {
    const newVisible = new Set<string>(visibleCategories)
    if (newVisible.has(category)) {
      newVisible.delete(category)
    } else {
      newVisible.add(category)
    }
    setVisibleCategories(newVisible)
    updateLocalSettings({ visibleLineChartCategories: newVisible })
  }

  const toggleAll = (checked: boolean) => {
    const newVisible = checked ? new Set<string>(allCategories) : new Set<string>()
    setVisibleCategories(newVisible)
    updateLocalSettings({ visibleLineChartCategories: newVisible })
  }

  useEffect(() => {
    if (!lineChartRef.current || last12Months.length === 0) return

    const svg = d3.select(lineChartRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 220
    const margin = { top: 20, right: 140, bottom: 30, left: 40 }
    const legendWidth = 120

    // Generate last 12 months
    const monthDates = Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      d.setDate(1)
      return d
    })

    const monthNames = monthDates.map(d => d3.timeFormat('%b')(d))

    // Extract unique categories
    const categories = Array.from(new Set(last12Months.map(d => d.category)))

    // Build dataset with missing months filled
    const dataset = categories.map(cat => {
      const values = monthDates.map(d => {
        const monthData = last12Months.filter(
          item =>
            item.category === cat &&
            new Date(item.month_start).getFullYear() === d.getFullYear() &&
            new Date(item.month_start).getMonth() === d.getMonth()
        )
        return monthData.reduce((sum, item) => sum + Number(item.total), 0)
      })
      return { name: cat, values }
    })

    // Filter dataset to only show visible categories
    const filteredDataset = dataset.filter(d => visibleCategories.has(d.name))

    // Scales
    const x = d3.scalePoint().domain(monthNames).range([margin.left, width - margin.right - legendWidth])
    const y = d3.scaleLinear().domain([0, d3.max(filteredDataset.flatMap(d => d.values))!]).nice().range([height - margin.bottom, margin.top])
    const color = d3.scaleOrdinal<string>().domain(categories).range(d3.schemeTableau10)

    const line = d3
      .line<number>()
      .x((d, i) => x(monthNames[i])!)
      .y(d => y(d))
      .curve(d3.curveMonotoneX)

    // Draw lines
    filteredDataset.forEach(series => {
      svg
        .append('path')
        .datum(series.values)
        .attr('fill', 'none')
        .attr('stroke', color(series.name)!)
        .attr('stroke-width', 2)
        .attr('d', line)
    })

    // X axis
    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x))

    // Y axis
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y))

    // Legend
    const legend = svg.append('g').attr('class', 'legend').attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`)
    dataset.forEach((series, i) => {
      const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`)
      
      legendRow.append('rect').attr('width', 12).attr('height', 12).attr('fill', color(series.name)!)
      
      legendRow.append('text')
        .attr('x', 16)
        .attr('y', 12)
        .attr('fill', '#ffffff')
        .style('font-size', '12px')
        .style('font-family', 'sans-serif')
        .text(series.name)
    })

    svg.attr('viewBox', `0 0 ${width} ${height}`).style('width', '100%').style('height', 'auto')

  }, [last12Months, visibleCategories])

  return (
    <>
      <div className="relative inline-block w-full">
        <svg ref={lineChartRef}></svg>
        <div
          onClick={() => setShowModal(true)}
          className="absolute inset-0 cursor-pointer"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Categories to Display</h2>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleCategories.size === allCategories.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-700">Select All</span>
              </label>
              
              <div className="border-t pt-3 space-y-2">
                {allCategories.sort().map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCategories.has(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}