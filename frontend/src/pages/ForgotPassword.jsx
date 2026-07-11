import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ForgotPassword() {
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [cooldown])

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault()
    if (!email) {
      setErrorMsg('Please enter your email address.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      setSuccessMsg(response.data.message || 'If that email is registered, we have sent an OTP.')
      setStep('otp')
      setCooldown(30) // 30 seconds cooldown for resend
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp })
      setResetToken(response.data.resetToken)
      setSuccessMsg('OTP verified successfully!')
      setStep('reset')
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        resetToken,
        newPassword
      })
      setSuccessMsg(response.data.message || 'Password reset successful!')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF4EE] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl mb-2">
            🌿
          </div>
          <h1 className="text-2xl font-bold text-green-700">FarmSmart</h1>
          <p className="text-gray-500 text-sm">Empowering Growth, Ensuring Clarity</p>
        </div>

        <h2 className="text-lg font-semibold text-center text-gray-800 mb-6">
          {step === 'email' && 'Forgot Password'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'reset' && 'Reset Password'}
        </h2>

        {/* Success and Error messages */}
        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg mb-4 text-center font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                We'll send a 6-digit OTP to your registered email to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                Sent to: <span className="font-semibold text-gray-600">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend option */}
            <div className="text-center text-xs mt-4">
              {cooldown > 0 ? (
                <span className="text-gray-400 font-medium">
                  Resend OTP in {cooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  className="text-green-700 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 py-2">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Change Email
            </button>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Already remembered?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-green-700 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </div>

      </div>
    </div>
  )
}
