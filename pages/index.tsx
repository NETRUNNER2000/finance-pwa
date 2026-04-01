import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const routeUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        router.replace('/dashboard')
      } else {
        router.replace('/landing')
      }
    }

    routeUser()
  }, [router])


  return null
}