import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../context/UserContext'
import { useSettings } from '../context/SettingsContext'
import { useDashboard } from '../context/DashboardContext'
import { supabase } from '../lib/supabaseClient'
import Page from '@/components/page'
import SankeyChart from '../components/SankeyChart'
import LineChart from '../components/LineChart'
import DateRangePicker from '../components/DateRangePicker'

export default function Dashboard() {
  const router = useRouter()
  const { selectedAccount } = useUser()
  const { settings, updateSettings } = useSettings()
  const { categoryTotals, last12Months, ensureDashboardData } = useDashboard()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/landing')
      }
    }

    checkAuth()
  }, [router])

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
    if (!selectedAccount || !settings) return

    ensureDashboardData(
      selectedAccount,
      settings.filterDataStartDate,
      settings.filterDataEndDate
    )
  }, [selectedAccount, settings, ensureDashboardData])

  return (
    <Page title="Dashboard">
      <div className="transparent-bg sankey-container">
        <SankeyChart categoryTotals={categoryTotals} settings={settings} />
      </div>

      <DateRangePicker
        startDate={settings?.filterDataStartDate || ''}
        endDate={settings?.filterDataEndDate || ''}
        onPrev={() => shiftFilterRange(-1)}
        onNext={() => shiftFilterRange(1)}
        onStartDateChange={date => updateSettings?.({ filterDataStartDate: date })}
        onEndDateChange={date => updateSettings?.({ filterDataEndDate: date })}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Transactions Last 12 Months</h2>
        <LineChart last12Months={last12Months} />
      </div>
    </Page>
  )
}