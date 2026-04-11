import Page from '@/components/page'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'


const User = () => {

  const { memoUser, setUser, selectedAccount, setSelectedAccount, sharedAccounts } = useUser()

  const [email, setEmail] = useState(memoUser?.email || '')
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

  if (!memoUser) return alert('User not authenticated')
  setGrantLoading(true)

  try {
    // Call the RPC function 'grant_transaction_access'
    const { data, error } = await supabase.rpc('grant_transaction_access', {
      p_user_email: sanitizedEmail,
      p_grantor_id: memoUser.id
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
    <Page title='User'>
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-3'>
            {/* Logout button */}
            <Button
              onClick={logout}
              variant="destructive"
            >
              Logout
            </Button>

            {/* Reset Password */}
            <div className='flex flex-col sm:flex-row gap-2'>
              <Input
                type='email'
                placeholder='Your email'
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
              <Button
                onClick={resetPassword}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant Transaction Access */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Share Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-4'>
            Enter another users email to grant them access to all your transactions.
          </p>

          <div className='flex flex-col sm:flex-row gap-2'>
            <Input
              type='email'
              placeholder="User's email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value.trim())}
            />
            <Button
              onClick={grantAccess}
              disabled={grantLoading}
            >
              {grantLoading ? 'Sharing...' : 'Grant Access'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}

export default User