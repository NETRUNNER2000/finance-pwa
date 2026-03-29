import React, { useState } from 'react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onPrev: () => void
  onNext: () => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export default function DateRangePicker({
  startDate,
  endDate,
  onPrev,
  onNext,
  onStartDateChange,
  onEndDateChange
}: DateRangePickerProps) {
  const [activePopup, setActivePopup] = useState<'start' | 'end' | null>(null)

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Previous timeframe"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePopup(activePopup === 'start' ? null : 'start')}
            className="text-sm text-white font-medium bg-white/10 px-3 py-1 rounded"
            aria-label="Edit start date"
          >
            {startDate}
          </button>
          <span className="text-sm text-white">—</span>
          <button
            onClick={() => setActivePopup(activePopup === 'end' ? null : 'end')}
            className="text-sm text-white font-medium bg-white/10 px-3 py-1 rounded"
            aria-label="Edit end date"
          >
            {endDate}
          </button>
        </div>

        <button
          onClick={onNext}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Next timeframe"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {activePopup && (
        <div className="mt-2 bg-white/95 text-gray-900 border border-gray-300 rounded shadow-lg p-3 w-[min(90vw,400px)]">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{activePopup === 'start' ? 'Start date' : 'End date'}</label>
            <input
              type="date"
              value={activePopup === 'start' ? startDate : endDate}
              onChange={e => {
                if (activePopup === 'start') onStartDateChange(e.target.value)
                else onEndDateChange(e.target.value)
              }}
              className="border p-2 rounded w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActivePopup(null)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
