import Head from 'next/head'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  title?: string
  children: React.ReactNode
  user?: any
  setUser: (user: any) => void
  selectedAccount?: string | null
  setSelectedAccount: (account: string | null) => void
}

interface SharedAccount {
  id: string
  displayName: string
}

const Page = ({
  title,
  children,
  user,
  setUser,
  selectedAccount,
  setSelectedAccount
}: Props) => {
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([])

  useEffect(() => {
    if (!user?.id) return

    const fetchSharedAccounts = async () => {
      // 1️⃣ Fetch all owner_ids that the user can view
      const { data: permissions, error: permError } = await supabase
        .from('transaction_permissions')
        .select('owner_id')
        .eq('viewer_id', user.id)

      if (permError) {
        console.error('Error fetching permissions:', permError)
        return
      }

      const ownerIds = permissions.map((row: any) => row.owner_id)

      // Always include the logged-in user's own id
      if (!ownerIds.includes(user.id)) ownerIds.unshift(user.id)

      // 2️⃣ Fetch display names from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ownerIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      // 3️⃣ Map to SharedAccount objects
      const accounts: SharedAccount[] = ownerIds.map((id: string) => {
        if (id === user.id) return { id, displayName: 'You' } // Show "You" for logged-in user
        const profile = profiles.find(p => p.id === id)
        return { id, displayName: profile?.display_name || 'Unknown' }
      })

      setSharedAccounts(accounts)
      console.log('Fetched shared accounts:', accounts)

      // Default selected account to self
      setSelectedAccount(user.id)
    }

    fetchSharedAccounts()
  }, [user, setSelectedAccount])

  return (
    <>
      {title && (
        <Head>
          <title>Rice Bowl | {title}</title>
        </Head>
      )}

      <Appbar
        user={user}
        setUser={setUser}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        sharedAccounts={sharedAccounts}
        setSharedAccounts={setSharedAccounts}
      />

      <main
        className="mx-auto max-w-screen-md pt-20 pb-16 px-safe sm:pb-0"
      >
        <div className="p-6">{children}</div>
      </main>

      <BottomNav />
    </>
  )
}

export default Page