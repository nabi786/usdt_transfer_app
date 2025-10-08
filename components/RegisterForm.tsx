'use client'

import { useState } from 'react'
import { UserPlus, Mail, Wallet, CheckCircle } from 'lucide-react'

interface RegisterFormProps {
  onUserRegistered: (user: any) => void
  walletAddress?: string
}

export default function RegisterForm({ onUserRegistered, walletAddress }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    binanceId: '',
    tronAddress: walletAddress || '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.setItem('currentUser', JSON.stringify(result.user))
        onUserRegistered(result.user)
        setMessage('Registration successful! You received 1000 USDT for demo.')
        setFormData({ binanceId: '', tronAddress: '', email: '' })
      } else {
        setMessage(result.error || 'Registration failed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="h-8 w-8 text-white" />
        <h2 className="text-2xl font-bold text-white">Register for USDT Demo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            <Wallet className="inline h-5 w-5 mr-2" />
            Binance ID
          </label>
          <input
            type="text"
            name="binanceId"
            value={formData.binanceId}
            onChange={handleChange}
            placeholder="Enter your Binance ID"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            <Wallet className="inline h-5 w-5 mr-2" />
            Tron Address
          </label>
          <input
            type="text"
            name="tronAddress"
            value={formData.tronAddress}
            onChange={handleChange}
            placeholder="Enter your Tron address"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            <Mail className="inline h-5 w-5 mr-2" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full usdt-gradient text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Registering...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Register & Get 1000 USDT
            </>
          )}
        </button>

        {message && (
          <div className={`p-4 rounded-xl ${
            message.includes('successful') 
              ? 'bg-green-500/20 text-green-100 border border-green-500/30' 
              : 'bg-red-500/20 text-red-100 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}