import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '../context/UserContext'
import { supabase } from '../lib/supabaseClient'

type Settings = {
  darkMode: boolean
  language: string
  grossIncome: number
  payday: number
  filterDataStartDate: string
  filterDataEndDate: string
  interestRate: number
  investmentBalance: number
  linechartInterval: 'daily' | 'weekly' | 'monthly' | 'yearly'
  monthlyTax: number
  monthlyUIF: number
  monthlyPension: number
}

type LocalSettings = {
  visibleLineChartCategories: Set<string>
  // Add more device-specific settings here as needed
}

type SettingsContextType = {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
  refreshSettings: () => Promise<void>
  localSettings: LocalSettings
  updateLocalSettings: (newSettings: Partial<LocalSettings>) => void
}

const defaultSettings: Settings = {
  darkMode: false,
  language: 'en',
  grossIncome: 0,
  payday: 25,
  filterDataStartDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
  filterDataEndDate: new Date().toISOString().split('T')[0],
  interestRate: 0,
  investmentBalance: 0,
  linechartInterval: 'monthly',
  monthlyTax: 0,
  monthlyUIF: 0,
  monthlyPension: 0
}

const defaultLocalSettings: LocalSettings = {
  visibleLineChartCategories: new Set()
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  refreshSettings: async () => {},
  localSettings: defaultLocalSettings,
  updateLocalSettings: () => {}
})

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { selectedAccount } = useUser()

  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [localSettings, setLocalSettings] = useState<LocalSettings>(defaultLocalSettings)

  const getCacheKey = (userId: string) => `settings_${userId}`
  const getLocalSettingsKey = () => `local_settings_device`

  // 🔑 Always get real auth user
  const getAuthUserId = async () => {
    const { data } = await supabase.auth.getUser()
    return data.user?.id
  }

  const mapFromDB = (data: any): Settings => ({
    darkMode: false,
    language: 'en',
    grossIncome: data.gross_income ?? 0,
    payday: data.payday ?? 25,
    filterDataStartDate: data.filter_data_start_date ?? new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    filterDataEndDate: data.filter_data_end_date ?? new Date().toISOString().split('T')[0],
    interestRate: data.interest_rate ?? 0,
    investmentBalance: data.investment_balance ?? 0,
    linechartInterval: data.linechart_interval ?? 'monthly',
    monthlyTax: data.monthly_tax ?? 0,
    monthlyUIF: data.monthly_uif ?? 0,
    monthlyPension: data.monthly_pension ?? 0
  })

  const mapToDB = (settings: Settings, userId: string) => ({
    user_id: userId,
    gross_income: settings.grossIncome,
    payday: settings.payday,
    filter_data_start_date: settings.filterDataStartDate,
    filter_data_end_date: settings.filterDataEndDate,
    interest_rate: settings.interestRate,
    investment_balance: settings.investmentBalance,
    linechart_interval: settings.linechartInterval,
    monthly_tax: settings.monthlyTax,
    monthly_uif: settings.monthlyUIF,
    monthly_pension: settings.monthlyPension
  })

  // 📱 Load local settings from localStorage
  const loadLocalSettings = () => {
    const key = getLocalSettingsKey()
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { visibleLineChartCategories?: string[] }
        setLocalSettings({
          visibleLineChartCategories: new Set<string>(parsed.visibleLineChartCategories || [])
        })
      } catch (e) {
        console.error('Error parsing local settings:', e)
        setLocalSettings(defaultLocalSettings)
      }
    } else {
      setLocalSettings(defaultLocalSettings)
    }
  }

  // 💾 Save local settings to localStorage
  const updateLocalSettings = (newSettings: Partial<LocalSettings>) => {
    setLocalSettings(prev => {
      const updated: LocalSettings = {
        ...prev,
        ...newSettings
      }
      
      const key = getLocalSettingsKey()
      const toStore = {
        visibleLineChartCategories: Array.from(updated.visibleLineChartCategories)
      }
      localStorage.setItem(key, JSON.stringify(toStore))
      
      return updated
    })
  }

  // 🚀 Fetch
  const fetchFromDB = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Fetch error:', error)
      return defaultSettings
    }

    if (!data) return defaultSettings

    return mapFromDB(data)
  }

  // ⚡ Load
  const loadSettings = async (userId: string) => {
    const cacheKey = getCacheKey(userId)

    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        setSettings(JSON.parse(cached))
      } catch {}
    } else {
      setSettings(defaultSettings)
    }

    const fresh = await fetchFromDB(userId)
    setSettings(fresh)
    localStorage.setItem(cacheKey, JSON.stringify(fresh))

    // Load local settings on account load
    loadLocalSettings()
  }

  // 🔄 Refresh
  const refreshSettings = async () => {
    if (!selectedAccount) return

    const fresh = await fetchFromDB(selectedAccount)
    setSettings(fresh)
    localStorage.setItem(getCacheKey(selectedAccount), JSON.stringify(fresh))
  }

  // 💾 Save (FIXED)
  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!selectedAccount) return

    const authUserId = await getAuthUserId()
    if (!authUserId) {
      console.error('No auth user')
      return
    }

    // 🚨 IMPORTANT:
    // If you are NOT using shared accounts yet → use authUserId
    const targetUserId = authUserId

    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    const payload = mapToDB(updated, targetUserId)
const { data } = await supabase.auth.getUser()

console.log('auth.uid():', data.user?.id)
console.log('payload.user_id:', payload.user_id)
    const { error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) {
      console.error('Failed to save settings', error)
      return
    }

    localStorage.setItem(getCacheKey(targetUserId), JSON.stringify(updated))

    // 🔥 FORCE FULL RESYNC
    const fresh = await fetchFromDB(targetUserId)
    setSettings(fresh)
    localStorage.setItem(getCacheKey(targetUserId), JSON.stringify(fresh))
  }

  // 🔁 Account switch
  useEffect(() => {
    if (!selectedAccount || typeof window === 'undefined') return

    loadSettings(selectedAccount)
  }, [selectedAccount])

  // 🔁 Load local settings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    loadLocalSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings, localSettings, updateLocalSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)