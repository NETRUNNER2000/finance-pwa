import Page from '@/components/page'
import DateRangePicker from '../components/DateRangePicker'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { invalidateSupabaseCache } from '../lib/cacheInvalidation'
import { useUser } from '../context/UserContext'
import { useSettings } from '../context/SettingsContext'
import { useDashboard } from '../context/DashboardContext'
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

interface Transaction {
  id: string
  amount: number
  category: string
  description?: string
  transaction_date: string
  transaction_type: string
}

const Transactions = () => {
  const router = useRouter()
  const { memoUser, selectedAccount } = useUser()
  const { settings, updateSettings } = useSettings()
  const { refreshDashboardData } = useDashboard()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0])

  const addMonths = (sourceDate: Date, months: number): Date => {
    const date = new Date(sourceDate)
    const day = date.getDate()
    date.setMonth(date.getMonth() + months)

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

  // --- Filters ---
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false)

  // At the top of Transactions component
useEffect(() => {
  const { category } = router.query
  if (category && typeof category === 'string') {
    setSelectedCategory(category)
  }
}, [router.query])
  // --- Fetch transactions ---
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedAccount) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', selectedAccount)

      if (settings?.filterDataStartDate) {
        query = query.gte('transaction_date', settings.filterDataStartDate)
      }

      if (settings?.filterDataEndDate) {
        query = query.lte('transaction_date', settings.filterDataEndDate)
      }

      // Only fetch transactions that are in the selected range.
      const { data, error } = await query

      if (error) console.error('Fetch transactions error:', error)
      else setTransactions(data || [])
    }

    fetchTransactions()
  }, [selectedAccount, settings?.filterDataStartDate, settings?.filterDataEndDate])

  // --- Add transaction ---
  const addTransaction = async (e: React.FormEvent, transactionType: string) => {
    e.preventDefault()
    if (!memoUser || !selectedAccount) return

    const parsedAmount = parseFloat(amount)
    const sanitizedCategory = category.trim()
    const sanitizedDescription = description.trim()

    if (!sanitizedCategory) return alert('Category cannot be empty')
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return alert('Amount must be a valid number greater than 0')

    try {
      const transactionPayload = {
        user_id: selectedAccount,
        amount: parsedAmount,
        category: sanitizedCategory,
        description: sanitizedDescription || null,
        transaction_date: transactionDate,
        transaction_type: transactionType
      }

      console.log('[Transactions] add payload:', transactionPayload)

      const { error } = await supabase.from('transactions').insert([
        transactionPayload
      ])
      if (error) throw error

      console.log('[Transactions] add success:', {
        user_id: selectedAccount,
        transaction_type: transactionType,
        category: sanitizedCategory,
        amount: parsedAmount,
        transaction_date: transactionDate
      })

      await invalidateSupabaseCache()
      if (settings?.filterDataStartDate && settings?.filterDataEndDate) {
        await refreshDashboardData(
          selectedAccount,
          settings.filterDataStartDate,
          settings.filterDataEndDate
        )
      }

      setAmount('')
      setCategory('')
      setDescription('')
      setTransactionDate('')

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', selectedAccount)
        .order('transaction_date', { ascending: false })

      setTransactions(data || [])
    } catch (err: any) {
      console.error('Add transaction error:', err)
      console.error('[Transactions] add failed payload:', {
        user_id: selectedAccount,
        transaction_type: transactionType,
        category: sanitizedCategory,
        amount: parsedAmount,
        transaction_date: transactionDate
      })
      alert(`Failed to add transaction: ${err.message}`)
    }
  }

  // --- Delete transaction ---
  const confirmDeleteTransaction = (id: string) => {
    setTransactionToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const deleteTransaction = async () => {
    if (!memoUser || !selectedAccount || !transactionToDelete) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionToDelete)
        .eq('user_id', selectedAccount)

      if (error) throw error
      await invalidateSupabaseCache()
      if (settings?.filterDataStartDate && settings?.filterDataEndDate) {
        await refreshDashboardData(
          selectedAccount,
          settings.filterDataStartDate,
          settings.filterDataEndDate
        )
      }
      setTransactions(transactions.filter(t => t.id !== transactionToDelete))
      setDeleteConfirmOpen(false)
      setTransactionToDelete(null)
    } catch (err: any) {
      console.error('Delete transaction error:', err)
      alert(`Delete failed: ${err.message}`)
    }
  }

  // --- Derived: unique categories for filter ---
  const categories = Array.from(new Set(transactions.map(t => t.category)))

  // --- Filtered transactions ---
  const filteredTransactions = transactions.filter(t => {
    const amountVal = t.amount
    const dateVal = new Date(t.transaction_date)

    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false
    if (minAmount && amountVal < parseFloat(minAmount)) return false
    if (maxAmount && amountVal > parseFloat(maxAmount)) return false
    if (startDate && dateVal < new Date(startDate)) return false
    if (endDate && dateVal > new Date(endDate)) return false

    return true
  }).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())

  return (
    <Page title="Transactions">
      {/* Date Range Controls (dashboard-styled) */}
      <DateRangePicker
        startDate={settings?.filterDataStartDate || ''}
        endDate={settings?.filterDataEndDate || ''}
        onPrev={() => shiftFilterRange(-1)}
        onNext={() => shiftFilterRange(1)}
        onStartDateChange={date => updateSettings?.({ filterDataStartDate: date })}
        onEndDateChange={date => updateSettings?.({ filterDataEndDate: date })}
      />

      {/* Add Transaction Form */}
      <Card className="mb-6">
        <CardHeader
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setShowAddTransactionForm(!showAddTransactionForm)}
        >
          <div className="flex items-center justify-between">
            <CardTitle>Add Transaction</CardTitle>
            <button
              className="rounded-full p-1 hover:bg-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowAddTransactionForm(!showAddTransactionForm)
              }}
            >
              <svg
                className={`w-6 h-6 transition-transform text-green-400 ${showAddTransactionForm ? 'rotate-45' : ''}`}
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
        </CardHeader>
        {showAddTransactionForm && (
          <CardContent style={{
            animation: 'slideDown 0.2s ease-out',
            transformOrigin: 'top'
          }}>
            <form className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <Input
                type="date"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                required
              />
              <Button
                type="submit"
                onClick={(e) => addTransaction(e, 'expense')}
                variant="outline"
                className="col-span-full sm:col-auto text-red-500 border-red-500 hover:border-red-400 hover:text-red-400"
                style={{
                  textShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                }}
              >
                Add Expense
              </Button>
              <Button
                type="submit"
                onClick={(e) => addTransaction(e, 'income')}
                variant="outline"
                className="col-span-full sm:col-auto text-green-500 border-green-500 hover:border-green-400 hover:text-green-400"
                style={{
                  textShadow: '0 0 10px rgba(74, 222, 128, 0.6)'
                }}
              >
                Add Income
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

{/* Mobile toggle */}
<div className="sm:hidden mb-2">
  <Button
    onClick={() => setShowFilters(prev => !prev)}
    variant="outline"
  >
    {showFilters ? 'Hide Filters' : 'Show Filters'}
  </Button>
</div>

<Card className={`mb-4 ${!showFilters ? 'hidden sm:block' : 'block'}`}>
  <CardHeader>
    <CardTitle>Filters</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {/* Category */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Min Amount */}
      <Input
        type="number"
        placeholder="Min Amount"
        value={minAmount}
        onChange={e => setMinAmount(e.target.value)}
      />
      {/* Max Amount */}
      <Input
        type="number"
        placeholder="Max Amount"
        value={maxAmount}
        onChange={e => setMaxAmount(e.target.value)}
      />
      {/* Start Date */}
      <Input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />
      {/* End Date */}
      <Input
        type="date"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
      />
    </div>
    <Button
      onClick={() => {
        setSelectedCategory('all')
        setMinAmount('')
        setMaxAmount('')
        setStartDate('')
        setEndDate('')
      }}
      variant="outline"
      className="mt-3"
    >
      Reset Filters
    </Button>
  </CardContent>
</Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions found</p>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base">{t.category}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </div>
                    {t.description && (
                      <div className="mt-1 text-sm text-foreground/70 truncate">
                        {t.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className={`font-semibold text-lg ${t.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.transaction_type === 'income' ? '+' : '-'}R{t.amount.toFixed(2)}
                    </span>
                    <Button
                      onClick={() => confirmDeleteTransaction(t.id)}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Delete Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteTransaction()
                    setDeleteConfirmOpen(false)
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Page>
  )
}

export default Transactions