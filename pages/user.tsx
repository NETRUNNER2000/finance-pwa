import Page from '@/components/page'
import Section from '@/components/section'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface TransactionsProps {
  user: any // type properly later
  setUser: (user: any) => void
  selectedAccount?: string | null
  setSelectedAccount: (account: string | null) => void
}

const User = ({ user, setUser, selectedAccount, setSelectedAccount }: TransactionsProps) => {
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [grantEmail, setGrantEmail] = useState('')
  const [grantLoading, setGrantLoading] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login' // redirect after logout
  }

  const resetPassword = async () => {
    if (!email) return alert('Email is required')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/updatepassword' // optional redirect after reset
    })
    setLoading(false)
    if (error) {
      alert(`Failed to send reset email: ${error.message}`)
    } else {
      alert('Password reset email sent! Check your inbox.')
    }
  }

  // --- Grant access to another user ---
const grantAccess = async () => {
  const sanitizedEmail = grantEmail.trim().toLowerCase()
  if (!sanitizedEmail) return alert('Enter a valid email')

  if (!user) return alert('User not authenticated')
  setGrantLoading(true)

  try {
    // Call the RPC function 'grant_transaction_access'
    const { data, error } = await supabase.rpc('grant_transaction_access', {
      p_user_email: sanitizedEmail,
      p_grantor_id: user.id
    })

    if (error) {
      console.error('RPC error:', error)
      alert('Failed to grant access: ' + error.message)
      return
    }

    // The SQL function returns a string message
    // Possible: 'User does not exist', 'Access already granted', 'Access granted successfully'
    if (data) {
      alert(data)
      if (data === 'Access granted successfully') {
        setGrantEmail('') // clear input on success
      }
    } else {
      alert('Unexpected response from server')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    alert('An unexpected error occurred')
  } finally {
    setGrantLoading(false)
  }
}
  return (
    <Page title='User' user={user} setUser={setUser} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}>

      <Section>
        <h2 className='text-xl font-semibold mb-2'>Account Actions</h2>
        <div className='flex flex-col sm:flex-row gap-3'>
          {/* Logout button */}
          <button
            onClick={logout}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition'
          >
            Logout
          </button>

          {/* Reset Password */}
          <div className='flex flex-col sm:flex-row gap-2'>
            <input
              type='email'
              placeholder='Your email'
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())} // sanitize input
              className='border p-2 rounded text-gray-900'
            />
            <button
              onClick={resetPassword}
              disabled={loading}
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
        </div>
      </Section>

      {/* Grant Transaction Access */}
      <Section>
        <h2 className='text-xl font-semibold mb-2'>Share Transactions</h2>
        <p className='text-zinc-600 dark:text-zinc-400 mb-2'>
          Enter another users email to grant them access to all your transactions.
        </p>

        <div className='flex flex-col sm:flex-row gap-2'>
          <input
            type='email'
            placeholder="User's email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value.trim())} // sanitize input
            className='border p-2 rounded text-gray-900'
          />
          <button
            onClick={grantAccess}
            disabled={grantLoading}
            className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition'
          >
            {grantLoading ? 'Sharing...' : 'Grant Access'}
          </button>
        </div>
      </Section>
    </Page>
  )
}

export default User