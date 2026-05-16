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
  const [showAddRecuringExpenseForm, setShowRecuringExpenseForm] = useState(false)
  const [newRecuringExpense, setNewRecuringExpense] = useState({ name: '', amount: 0 })
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
    monthlyPension: 0,
    recuringExpenses: [] as { name: string, amount: number }[]
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
      monthlyPension: settings.monthlyPension || 0,
      recuringExpenses: settings.recuringExpenses || []
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

            <div className="flex items-center justify-between">
               <label className="block font-medium mb-1">Recurring Expenses</label>
              <button
                className="rounded-full p-1 hover:bg-accent transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowRecuringExpenseForm(!showAddRecuringExpenseForm)
                }}
              >
                <svg
                  className={`w-6 h-6 transition-transform text-green-400 ${showAddRecuringExpenseForm ? 'rotate-45' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8))',
                    strokeWidth: 2.5
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button> 
            </div>
            
              {showAddRecuringExpenseForm && (
                <div className="mt-2">
                  <Input
                    type="text"
                    placeholder="Expense Name"
                    onChange={e => {
                      setNewRecuringExpense({ name: e.target.value, amount: newRecuringExpense.amount })
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    step={0.01}
                    onChange={e => {
                     setNewRecuringExpense({ name: newRecuringExpense.name, amount: parseFloat(e.target.value) || 0 })
                    }}
                  />
              <Button
                type="submit"
                onClick={(e) => {
                  handleChange('recuringExpenses', [...localSettings.recuringExpenses, newRecuringExpense])
                  setNewRecuringExpense({ name: '', amount: 0 })
                  setShowRecuringExpenseForm(false)
                }}
                variant="outline"
                className="col-span-full sm:col-auto text-green-500 border-green-500 hover:border-green-400 hover:text-green-400"
                style={{
                  textShadow: '0 0 10px rgba(74, 222, 128, 0.6)'
                }}
              >
                Add Recurring Expense
              </Button>
  
                </div>
              )}
              {
                localSettings.recuringExpenses.map((expense, index) => (
                  <div className="bg-card">
                    <label className="block font-medium mb-1">Recurring Expense {index + 1}</label>
                    <div className="flex items-center gap-4 ml-4" key={index}>
                      <Input
                        type="text"
                        value={expense.name}
                        onChange={e => {
                          const newExpenses = [...localSettings.recuringExpenses]
                          newExpenses[index].name = e.target.value
                          handleChange('recuringExpenses', newExpenses)
                        }}
                      />
                      <Input
                        type="number"
                        value={expense.amount}
                        onChange={e => {
                          const newExpenses = [...localSettings.recuringExpenses]
                          newExpenses[index].amount = parseFloat(e.target.value) || 0
                          handleChange('recuringExpenses', newExpenses)
                        }}
                      />
                      <Button
                            onClick={() => {
                              const newExpenses = localSettings.recuringExpenses.filter((_, i) => _ !== expense)
                              handleChange('recuringExpenses', newExpenses)
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                      </Button>
                    </div>
                  </div>
                ))
              }


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