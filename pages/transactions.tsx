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
  const [shareEmails, setShareEmails] = useState<{ [key: string]: string }>({})

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
  const deleteTransaction = async (id: string) => {
    if (!memoUser || !selectedAccount) return
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
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
      setTransactions(transactions.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('Delete transaction error:', err)
      alert(`Delete failed: ${err.message}`)
    }
  }

  // --- Share transaction ---
  const shareTransaction = async (transactionId: string) => {
    const email = shareEmails[transactionId]?.trim()
    if (!email) return alert("Enter a user's email")
    if (!memoUser) return

    try {
      const { data: partnerUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !partnerUser) return alert('User not found')

      const { error: insertError } = await supabase
        .from('transaction_access')
        .insert([{ transaction_id: transactionId, user_id: partnerUser.id }])

      if (insertError) throw insertError

      alert('Transaction shared!')
      setShareEmails({ ...shareEmails, [transactionId]: '' })
    } catch (err: any) {
      console.error('Share transaction error:', err)
      alert(`Something went wrong: ${err.message}`)
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
  })

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
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
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
              className="col-span-full sm:col-auto"
            >
              Add Expense
            </Button>
            <Button
              type="submit"
              onClick={(e) => addTransaction(e, 'income')}
              variant="outline"
              className="col-span-full sm:col-auto"
            >
              Add Income
            </Button>
          </form>
        </CardContent>
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
      <select
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
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
            <p className="text-muted-foreground">No transactions found</p>
          ) : (
            <ul className="space-y-4">
              {filteredTransactions.map(t => (
                <li
                  key={t.id}
                  className="border p-4 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                >
                  <div className="flex-1">
                    {`${t.transaction_type} `}<strong>{t.category}</strong>: ${t.amount.toFixed(2)}
                    {` on ${new Date(t.transaction_date).toLocaleDateString()}`}
                    {t.description && ` — ${t.description}`}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <Input
                      type="email"
                      placeholder="Partner email"
                      value={shareEmails[t.id] || ''}
                      onChange={e =>
                        setShareEmails({ ...shareEmails, [t.id]: e.target.value })
                      }
                      className="flex-1 sm:w-48"
                    />
                    <Button
                      onClick={() => shareTransaction(t.id)}
                      variant="outline"
                      size="sm"
                    >
                      Share
                    </Button>
                    <Button
                      onClick={() => deleteTransaction(t.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </Page>
  )
}

export default Transactions