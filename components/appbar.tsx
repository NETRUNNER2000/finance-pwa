import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { Button } from './ui/button'

const links = [
  {label: 'Dashboard', href:"/dashboard"},
  { label: 'Transactions', href: '/transactions' },
  {label: 'Settings', href:'/settings'}
  
]


const Appbar = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { memoUser, setUser, selectedAccount, setSelectedAccount, sharedAccounts } = useUser()
  useEffect(() => {
    console.log("User updated:", memoUser)
    setUser(memoUser)
  }, [memoUser, setUser])
  
  return (
    <div className='fixed top-0 left-0 z-20 w-full pt-safe' style={{ backgroundColor: 'var(--appbar-bg)' }}>
      <header className='border-b px-safe' style={{ backgroundColor: 'var(--appbar-bg)' }}>
        <div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>

          <Link href='/'>
            <h1 className='font-medium'>Welcome {memoUser?.displayName || 'loading...'}</h1>
          </Link>

          <nav className='flex items-center space-x-6'>
            <div className='hidden sm:block'>
              <div className='flex items-center space-x-1'>
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                  >
                    <Button
                      variant={router.pathname === href ? "default" : "ghost"}
                      className='text-sm'
                    >
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Selected account dropdown */}
            <div className="relative">
              <Button
                onClick={() => setOpen(!open)}
                variant="outline"
                className="w-28 justify-center"
              >
                {sharedAccounts.find(a => a.id === selectedAccount)?.displayName || 'Select Account'}
              </Button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg p-2 space-y-1">

                  <Link href="/user">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                    >
                      My Account
                    </Button>
                  </Link>

                  <div className="border-t border-border my-1"/>

                  {/* Shared accounts */}
                  {sharedAccounts.length === 0 ? (
                    <div className="text-xs px-2 text-muted-foreground">None</div>
                  ) : (
                    sharedAccounts.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => { setSelectedAccount(item.id); setOpen(false) }}
                        className="w-full justify-start text-xs"
                      >
                        {item.displayName}
                      </Button>
                    ))
                  )}

                </div>
              )}
            </div>

          </nav>
        </div>
      </header>
    </div>
  )
}

export default Appbar