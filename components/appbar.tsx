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
    <div
      className='fixed top-0 left-0 z-20 w-full pt-safe overflow-hidden'
      style={{
        backgroundColor: 'rgba(20, 20, 20, 0.4)',
        backdropFilter: 'blur(8px) brightness(1.05)',
        WebkitBackdropFilter: 'blur(8px) brightness(1.05)',
        background: `
          radial-gradient(ellipse 150% 150% at 50% -30%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
          rgba(20, 20, 20, 0.4)
        `,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95%',
          height: '3px',
          background: `
            linear-gradient(90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.15) 25%,
              rgba(255, 255, 255, 0.35) 50%,
              rgba(255, 255, 255, 0.15) 75%,
              transparent 100%
            )
          `,
          borderRadius: '50%',
          filter: 'blur(0.5px)',
        }}
      />
      <header
        className='border-b px-safe relative'
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: `
            0 4px 16px -8px rgba(0, 0, 0, 0.7),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.5)
          `,
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          background: `
            radial-gradient(ellipse 180% 120% at 50% -10%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 35%, transparent 70%),
            rgba(15, 15, 15, 0.25)
          `,
        }}
      >
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