import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      alert(error.message)
    } else {
      alert('Password reset email sent! Check your inbox.')
      setIsForgotPassword(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">{isForgotPassword ? 'Reset Password' : 'Login'}</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {!isForgotPassword && (
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {isForgotPassword ? (
        <button
          onClick={handleForgotPassword}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Send Reset Email
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      )}

      {isForgotPassword ? (
        <a
          onClick={() => setIsForgotPassword(false)}
          className="text-blue-600 cursor-pointer"
        >
          Back to Login
        </a>
      ) : (
        <a
          onClick={() => setIsForgotPassword(true)}
          className="text-blue-600 cursor-pointer"
        >
          Forgot Password?
        </a>
      )}

      <Link href='/register'>Not a user? Signup!</Link>
    </div>
  )
}