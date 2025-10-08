'use client'

import { useState } from 'react'
import { ArrowRightLeft, Send, Coins } from 'lucide-react'

interface TransferFormProps {
  currentUser: any
}

export default function TransferForm({ currentUser }: TransferFormProps) {
  const [formData, setFormData] = useState({
    fromBinanceId: currentUser?.binanceId || '',
    toBinanceId: '',
    amount: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount) || 0
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Transfer successful! ${result.message}`)
        setFormData({
          ...formData,
          toBinanceId: '',
          amount: ''
        })
      } else {
        setMessage(result.error || 'Transfer failed')
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

  if (!currentUser) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <ArrowRightLeft className="h-8 w-8 text-white" />
          <h2 className="text-2xl font-bold text-white">Transfer USDT</h2>
        </div>
        <p className="text-white/80 text-center py-8">
          Please register first to transfer DUSDT tokens
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRightLeft className="h-8 w-8 text-white" />
        <h2 className="text-2xl font-bold text-white">Transfer USDT</h2>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-yellow-200">
          <Coins className="h-5 w-5" />
          <span className="font-medium">Demo Features:</span>
        </div>
        <ul className="text-yellow-100 text-sm mt-2 space-y-1">
          <li>• Transfer any amount including 0 USDT</li>
          <li>• Both sender and receiver get notifications</li>
          <li>• Uses Binance IDs instead of wallet addresses</li>
          <li>• No trading or withdrawal restrictions</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            From Binance ID
          </label>
          <input
            type="text"
            name="fromBinanceId"
            value={formData.fromBinanceId}
            onChange={handleChange}
            placeholder="Your Binance ID"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            To Binance ID
          </label>
          <input
            type="text"
            name="toBinanceId"
            value={formData.toBinanceId}
            onChange={handleChange}
            placeholder="Recipient's Binance ID"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Amount (USDT) - Can be 0
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.000001"
            min="0"
            placeholder="0.000000 (can be 0)"
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
              Transferring...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Transfer USDT
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