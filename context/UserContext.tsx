import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface SharedAccount {
  id: string
  displayName: string
}

interface UserContextType {
  memoUser: any
  setUser: (user: any) => void
  selectedAccount: string | null
  setSelectedAccount: (id: string | null) => void
  sharedAccounts: SharedAccount[]
  setSharedAccounts: (accounts: SharedAccount[]) => void
}

const UserContext = createContext<UserContextType>({
  memoUser: null,
  setUser: () => {},
  selectedAccount: null,
  setSelectedAccount: () => {},
  sharedAccounts: [],
  setSharedAccounts: () => {},
})

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([])
  const memoUser = useMemo(() => user, [user?.id, user?.displayName])
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched) return;

    const fetchUserAndProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const authUser = authData.user
      if (!authUser) return

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', authUser.id)
        .single()

      if (profileError) console.error(profileError)

      setUser({ ...authUser, displayName: profileData?.display_name || '' })
      setSelectedAccount(authUser.id)
      setFetched(true)
    }

    fetchUserAndProfile()
  }, []) // empty dependency array ensures this runs only once

  // 2️⃣ Fetch shared accounts once user exists
  useEffect(() => {
    if (!user?.id) return

    const fetchSharedAccounts = async () => {
      const { data: permissions, error: permError } = await supabase
        .from('transaction_permissions')
        .select('owner_id')
        .eq('viewer_id', user.id)

      if (permError) {
        console.error('Error fetching permissions:', permError)
        return
      }

      const ownerIds = permissions.map((row: any) => row.owner_id)
      if (!ownerIds.includes(user.id)) ownerIds.unshift(user.id)

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ownerIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      const accounts: SharedAccount[] = ownerIds.map((id: string) => {
        if (id === user.id) return { id, displayName: 'You' }
        const profile = profiles.find(p => p.id === id)
        return { id, displayName: profile?.display_name || 'Unknown' }
      })

      setSharedAccounts(accounts)
    }

    fetchSharedAccounts()
  }, [user?.id])

  return (
    <UserContext.Provider
      value={{
        memoUser,
        setUser,
        selectedAccount,
        setSelectedAccount,
        sharedAccounts,
        setSharedAccounts,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Hook for easy access
export const useUser = () => useContext(UserContext)