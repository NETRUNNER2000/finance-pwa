import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  // useEffect(() => {
  //   const run = async () => {
  //     const { data } = await supabase.auth.getUser()

  //     router.replace(data.user ? '/dashboard' : '/landing')
  //   }

  //   run()
  // }, [router])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff'
    }}>
      Loading...
    </div>
  )
}