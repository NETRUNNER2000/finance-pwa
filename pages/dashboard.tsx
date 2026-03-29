import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../context/UserContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabaseClient'
import Page from '@/components/page'
import SankeyChart from '../components/SankeyChart'
import LineChart from '../components/LineChart'

interface CategoryTotal {
  category: string
  total: number
  transaction_type: 'income' | 'expense'
}

export default function Dashboard() {
  const router = useRouter()
  const { selectedAccount } = useUser()
  const { settings, updateSettings } = useSettings()
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  const [last12Months, setLast12Months] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  // Fetch category totals
const fetchCategoryTotals = useCallback(async (userId: string) => {
  if (!userId) return

  const today = new Date()

  // Build start + end dates for current month (for logs only)
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const { data, error } = await supabase.rpc('get_category_totals_by_range', {
    p_user_id: userId,
    p_start_date: settings.filterDataStartDate,
    p_end_date: settings.filterDataEndDate
  })

  console.log(`Fetched category totals for ${settings.filterDataStartDate} → ${settings.filterDataEndDate}:`, data)

  if (error) console.error(error)
  else setCategoryTotals(data || [])
}, [settings.filterDataStartDate, settings.filterDataEndDate])

  // Fetch last 12 months
  const fetchLast12Months = useCallback(async (userId: string) => {
    if (!userId) return
    const { data, error } = await supabase.rpc('get_category_totals_last_months', {
      p_user_id: userId,
      p_months_back: 12
    })
    if (error) console.error(error)
    else setLast12Months(data || [])
  }, [])

  const addMonths = (sourceDate: Date, months: number): Date => {
    const date = new Date(sourceDate)
    const day = date.getDate()
    date.setMonth(date.getMonth() + months)

    // Handle month overflow (e.g., Jan 31 -> Feb 28/29)
    if (date.getDate() < day) {
      date.setDate(0)
    }

    return date
  }

  const shiftFilterRange = async (months: number) => {
    if (!settings || !updateSettings) return

    const currentStart = new Date(settings.filterDataStartDate)
    const currentEnd = new Date(settings.filterDataEndDate)

    const newStart = addMonths(currentStart, months)
    const newEnd = addMonths(currentEnd, months)

    await updateSettings({
      filterDataStartDate: newStart.toISOString().split('T')[0],
      filterDataEndDate: newEnd.toISOString().split('T')[0]
    })
  }

  useEffect(() => {
    if (!selectedAccount) return
    fetchCategoryTotals(selectedAccount)
    fetchLast12Months(selectedAccount)
  }, [selectedAccount, fetchCategoryTotals, fetchLast12Months])

  return (
    <Page title="Dashboard">
      <div className="transparent-bg sankey-container">
        <SankeyChart categoryTotals={categoryTotals} settings={settings} />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          onClick={() => shiftFilterRange(-1)}
          className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Previous timeframe"
        >
          ←
        </button>
        <button
          onClick={() => shiftFilterRange(1)}
          className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Next timeframe"
        >
          →
        </button>
      </div>

      <div className="mt-4 p-4 rounded bg-white/10 text-white">
        <p className="text-sm font-medium">Filter Range</p>
        <p className="text-sm">Start: {settings.filterDataStartDate}</p>
        <p className="text-sm">End: {settings.filterDataEndDate}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Transactions Last 12 Months</h2>
        <LineChart last12Months={last12Months} />
      </div>
    </Page>
  )
}