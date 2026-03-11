'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForgotPasswordMutation } from '@/redux/api/authApi'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const result = await forgotPassword({ email: email.trim() }).unwrap()
      const successMessage = result?.message || 'If this email exists, a reset link has been sent.'
      setMessage(successMessage)
      toast.success(successMessage)
    } catch (err: any) {
      const errorMessage = err?.data?.error || err?.data?.message || 'Failed to send reset link.'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password</h1>
          <p className="text-sm text-gray-600 mb-6">Enter your email and we will send a reset link.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
