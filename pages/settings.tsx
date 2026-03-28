import Page from '@/components/page'
import Section from '@/components/section'
import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useUser } from '../context/UserContext'

const Settings = () => {
  const { settings, updateSettings, refreshSettings } = useSettings()
  const { selectedAccount } = useUser()

  const [localSettings, setLocalSettings] = useState({
    grossIncome: 0,
    payday: 1,
    interestRate: 0,
    investmentBalance: 0,
    filterDataStartDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    filterDataEndDate: new Date().toISOString().split('T')[0],
    linechartInterval: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    monthlyTax: 0,
    monthlyUIF: 0,
    monthlyPension: 0
  })

  // 🔑 SYNC when settings OR account changes
  useEffect(() => {
    if (!selectedAccount) return

    setLocalSettings({
      grossIncome: settings.grossIncome || 0,
      payday: settings.payday || 1,
      interestRate: settings.interestRate || 0,
      investmentBalance: settings.investmentBalance || 0,
      filterDataStartDate: settings.filterDataStartDate || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      filterDataEndDate: settings.filterDataEndDate || new Date().toISOString().split('T')[0],
      linechartInterval: settings.linechartInterval || 'monthly',
      monthlyTax: settings.monthlyTax || 0,
      monthlyUIF: settings.monthlyUIF || 0,
      monthlyPension: settings.monthlyPension || 0
    })
  }, [settings, selectedAccount])

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    await updateSettings(localSettings)
    alert('Settings saved!')
  }

  const handleRefresh = async () => {
    await refreshSettings()
    alert('Settings refreshed from server!')
  }

  return (
    <Page title="Settings">
      <Section>
        <h2 className="text-xl font-semibold mb-4">Settings</h2>

        <div className="space-y-4">

          <div>
            <label className="block font-medium mb-1">Gross Income</label>
            <input
              type="number"
              min={0}
              value={localSettings.grossIncome}
              onChange={e => handleChange('grossIncome', parseInt(e.target.value) || 0)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Monthly Tax</label>
            <input
              type="number"
              min={0}
              value={localSettings.monthlyTax}
              onChange={e => handleChange('monthlyTax', parseInt(e.target.value) || 0)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Monthly UIF</label>
            <input
              type="number"
              min={0}
              value={localSettings.monthlyUIF}
              onChange={e => handleChange('monthlyUIF', parseInt(e.target.value) || 0)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Monthly Pension</label>
            <input
              type="number"
              min={0}
              value={localSettings.monthlyPension}
              onChange={e => handleChange('monthlyPension', parseInt(e.target.value) || 0)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Payday (1–31)</label>
            <input
              type="number"
              min={1}
              max={31}
              value={localSettings.payday}
              onChange={e => handleChange('payday', parseInt(e.target.value) || 1)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step={0.01}
              value={localSettings.interestRate}
              onChange={e => handleChange('interestRate', parseFloat(e.target.value) || 0)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Investment Account Balance (Start of Month)
            </label>
            <input
              type="number"
              step={0.01}
              value={localSettings.investmentBalance}
              onChange={e => handleChange('investmentBalance', parseFloat(e.target.value) || 0)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Line Chart Interval</label>
            <select
              value={localSettings.linechartInterval}
              onChange={e => handleChange('linechartInterval', e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Data Filter Start Date</label>
            <input
              type="date"
              value={localSettings.filterDataStartDate}
              onChange={e => handleChange('filterDataStartDate', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Data Filter End Date</label>
            <input
              type="date"
              value={localSettings.filterDataEndDate}
              onChange={e => handleChange('filterDataEndDate', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Settings
            </button>

            <button
              onClick={handleRefresh}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>

        </div>
      </Section>
    </Page>
  )
}

export default Settings