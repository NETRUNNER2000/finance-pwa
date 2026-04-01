import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface CategoryTotal {
  category: string
  total: number
  transaction_type: 'income' | 'expense'
}

type Last12MonthRow = any

type DashboardContextType = {
  categoryTotals: CategoryTotal[]
  last12Months: Last12MonthRow[]
  loading: boolean
  ensureDashboardData: (userId: string, startDate: string, endDate: string) => Promise<void>
  refreshDashboardData: (userId: string, startDate: string, endDate: string) => Promise<void>
}

const DashboardContext = createContext<DashboardContextType>({
  categoryTotals: [],
  last12Months: [],
  loading: false,
  ensureDashboardData: async () => {},
  refreshDashboardData: async () => {}
})

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  const [last12Months, setLast12Months] = useState<Last12MonthRow[]>([])
  const [loading, setLoading] = useState(false)

  const [categoryTotalsCache, setCategoryTotalsCache] = useState<Record<string, CategoryTotal[]>>({})
  const [last12MonthsCache, setLast12MonthsCache] = useState<Record<string, Last12MonthRow[]>>({})

  const ensureDashboardData = useCallback(async (userId: string, startDate: string, endDate: string) => {
    if (!userId) return

    const categoryKey = `${userId}:${startDate}:${endDate}`
    const monthsKey = userId

    const cachedCategoryTotals = categoryTotalsCache[categoryKey]
    const cachedLast12Months = last12MonthsCache[monthsKey]

    if (cachedCategoryTotals && cachedLast12Months) {
      console.log('[DashboardContext] category totals (cache):', cachedCategoryTotals)
      console.log('[DashboardContext] last 12 months (cache):', cachedLast12Months)
      setCategoryTotals(cachedCategoryTotals)
      setLast12Months(cachedLast12Months)
      return
    }

    setLoading(true)

    try {
      let nextCategoryTotals = cachedCategoryTotals
      let nextLast12Months = cachedLast12Months

      if (!nextCategoryTotals) {
        const { data, error } = await supabase.rpc('get_category_totals_by_range', {
          p_user_id: userId,
          p_start_date: startDate,
          p_end_date: endDate
        })

        if (error) {
          console.error(error)
        } else {
          nextCategoryTotals = data || []
          console.log('[DashboardContext] category totals (fresh):', nextCategoryTotals)
          setCategoryTotalsCache(prev => ({
            ...prev,
            [categoryKey]: nextCategoryTotals || []
          }))
        }
      }

      if (!nextLast12Months) {
        const { data, error } = await supabase.rpc('get_category_totals_last_months', {
          p_user_id: userId,
          p_months_back: 12
        })

        if (error) {
          console.error(error)
        } else {
          nextLast12Months = data || []
          console.log('[DashboardContext] last 12 months (fresh):', nextLast12Months)
          setLast12MonthsCache(prev => ({
            ...prev,
            [monthsKey]: nextLast12Months || []
          }))
        }
      }

      if (nextCategoryTotals) setCategoryTotals(nextCategoryTotals)
      if (nextLast12Months) setLast12Months(nextLast12Months)
    } finally {
      setLoading(false)
    }
  }, [categoryTotalsCache, last12MonthsCache])

  const refreshDashboardData = useCallback(async (userId: string, startDate: string, endDate: string) => {
    if (!userId) return

    const categoryKey = `${userId}:${startDate}:${endDate}`
    const monthsKey = userId

    setLoading(true)

    try {
      const [categoryResponse, monthsResponse] = await Promise.all([
        supabase.rpc('get_category_totals_by_range', {
          p_user_id: userId,
          p_start_date: startDate,
          p_end_date: endDate
        }),
        supabase.rpc('get_category_totals_last_months', {
          p_user_id: userId,
          p_months_back: 12
        })
      ])

      if (categoryResponse.error) {
        console.error(categoryResponse.error)
      } else {
        const nextCategoryTotals = categoryResponse.data || []
        console.log('[DashboardContext] category totals (refresh):', nextCategoryTotals)
        setCategoryTotals(nextCategoryTotals)
        setCategoryTotalsCache(prev => ({
          ...prev,
          [categoryKey]: nextCategoryTotals
        }))
      }

      if (monthsResponse.error) {
        console.error(monthsResponse.error)
      } else {
        const nextLast12Months = monthsResponse.data || []
        console.log('[DashboardContext] last 12 months (refresh):', nextLast12Months)
        setLast12Months(nextLast12Months)
        setLast12MonthsCache(prev => ({
          ...prev,
          [monthsKey]: nextLast12Months
        }))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(() => ({
    categoryTotals,
    last12Months,
    loading,
    ensureDashboardData,
    refreshDashboardData
  }), [categoryTotals, last12Months, loading, ensureDashboardData, refreshDashboardData])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => useContext(DashboardContext)
