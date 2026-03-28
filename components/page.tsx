import Head from 'next/head'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'
import { useUser } from '../context/UserContext'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  title?: string
  children: React.ReactNode
}

const Page = ({
  title,
  children
}: Props) => {
  return (
    <>
      {title && (
        <Head>
          <title>Stonks Personal Finance | {title}</title>
        </Head>
      )}

      <Appbar/>

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