import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, form)
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed')
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
          Login to your account
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex mt-1">
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg text-sm text-gray-600">
                +91
              </span>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="98765 43210"
                required
                className="w-full border border-gray-300 rounded-r-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <span
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-green-700 cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-2.5 text-gray-400 text-sm"
              >
                {passwordVisible ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error message */}
          {message && (
            <p className="text-sm text-center text-red-500">{message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Register link */}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full border border-green-700 text-green-700 font-semibold py-2.5 rounded-lg hover:bg-green-50 transition duration-200"
          >
            Register
          </button>

        </form>
      </div>
    </div>
  )
}