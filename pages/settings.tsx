import Page from '@/components/page'
import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useUser } from '../context/UserContext'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

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
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">

              <div>
                <label className="block font-medium mb-1">Gross Income</label>
                <Input
                  type="number"
                  min={0}
                  value={localSettings.grossIncome}
                  onChange={e => handleChange('grossIncome', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Monthly Tax</label>
                <Input
                  type="number"
                  min={0}
                  value={localSettings.monthlyTax}
                  onChange={e => handleChange('monthlyTax', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Monthly UIF</label>
                <Input
                  type="number"
                  min={0}
                  value={localSettings.monthlyUIF}
                  onChange={e => handleChange('monthlyUIF', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Monthly Pension</label>
                <Input
                  type="number"
                  min={0}
                  value={localSettings.monthlyPension}
                  onChange={e => handleChange('monthlyPension', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Payday (1–31)</label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={localSettings.payday}
                  onChange={e => handleChange('payday', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Interest Rate (%)</label>
                <Input
                  type="number"
                  step={0.01}
                  value={localSettings.interestRate}
                  onChange={e => handleChange('interestRate', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Investment Account Balance (Start of Month)
                </label>
                <Input
                  type="number"
                  step={0.01}
                  value={localSettings.investmentBalance}
                  onChange={e => handleChange('investmentBalance', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Line Chart Interval</label>
                <Select value={localSettings.linechartInterval} onValueChange={(value) => handleChange('linechartInterval', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Data Filter Start Date</label>
                <Input
                  type="date"
                  value={localSettings.filterDataStartDate}
                  onChange={e => handleChange('filterDataStartDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Data Filter End Date</label>
                <Input
                  type="date"
                  value={localSettings.filterDataEndDate}
                  onChange={e => handleChange('filterDataEndDate', e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                >
                  Save Settings
                </Button>

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
    </Page>
  )
}

export default Settings