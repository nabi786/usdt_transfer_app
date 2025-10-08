'use client'

import { useState, useEffect } from 'react'
import { Wallet, RefreshCw, Coins } from 'lucide-react'

interface BalanceCardProps {
  currentUser: any
}

export default function BalanceCard({ currentUser }: BalanceCardProps) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [binanceId, setBinanceId] = useState(currentUser?.binanceId || '')
  const [message, setMessage] = useState('')
  const [showTokenInstructions, setShowTokenInstructions] = useState(false)

  const checkBalance = async () => {
    if (!binanceId) {
      setMessage('Please enter a Binance ID')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/balance/${binanceId}`)
      const result = await response.json()

      if (response.ok) {
        setBalance(result.balance)
        setMessage('')
        // Show token instructions if user has balance but might not see it in wallet
        if (result.balance > 0) {
          setShowTokenInstructions(true)
        }
      } else {
        setMessage(result.error || 'Failed to get balance')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkContractBalance = async () => {
    if (!currentUser?.tronAddress) {
      setMessage('No Tron address found. Please connect wallet first.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Check if TronLink is available
      if (typeof window !== 'undefined' && window.tronWeb && window.tronWeb.ready) {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
        if (!contractAddress) {
          setMessage('Contract address not configured')
          return
        }

        // Get contract instance
        const contract = await window.tronWeb.contract().at(contractAddress)
        
        // Call balanceOf function
        const balance = await contract.balanceOf(currentUser.tronAddress).call()
        const balanceInUSDT = balance / 1000000 // Convert from smallest unit to USDT (6 decimals)
        
        setBalance(balanceInUSDT)
        setMessage(`Contract balance: ${balanceInUSDT.toFixed(6)} USDT`)
      } else {
        setMessage('TronLink not connected. Please connect your wallet first.')
      }
    } catch (err) {
      console.error('Error checking contract balance:', err)
      setMessage('Failed to check contract balance: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.binanceId) {
      setBinanceId(currentUser.binanceId)
      checkBalance()
    }
  }, [currentUser])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="h-8 w-8 text-white" />
        <h2 className="text-2xl font-bold text-white">USDT Balance</h2>
      </div>

      {/* Balance Display */}
      <div className="usdt-gradient rounded-2xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="h-6 w-6 text-white" />
          <h3 className="text-white text-lg font-medium">USDT</h3>
        </div>
        <div className="text-4xl font-bold text-white">
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : (
            `${balance.toFixed(6)} USDT`
          )}
        </div>
        <p className="text-white/80 text-sm mt-2">
          Demo tokens for testing transfers
        </p>
        
        {/* Token Instructions - Only show if user has balance */}
        {showTokenInstructions && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-yellow-200 font-semibold mb-2">📱 To See Tokens in TronLink:</h4>
                <div className="text-yellow-100 text-sm space-y-1">
                  <p>1. Open TronLink wallet</p>
                  <p>2. Go to "Assets" → "Add Token"</p>
                  <p>3. Enter: <code className="bg-black/30 px-1 rounded">TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo</code></p>
                  <p>4. Name: Demo USDT, Symbol: DUSDT, Decimals: 6</p>
                </div>
              </div>
              <button
                onClick={() => setShowTokenInstructions(false)}
                className="text-yellow-300 hover:text-yellow-100 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Balance Checker */}
      <div className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Check Balance for Binance ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={binanceId}
              onChange={(e) => setBinanceId(e.target.value)}
              placeholder="Enter Binance ID"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-colors"
            />
            <button
              onClick={checkBalance}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Contract Balance Checker */}
          <div className="mt-4">
            <button
              onClick={checkContractBalance}
              disabled={loading}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-3 rounded-xl transition-colors disabled:opacity-50 border border-blue-500/30"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Checking Contract...
                </div>
              ) : (
                'Check Contract Balance (Direct)'
              )}
            </button>
            <p className="text-blue-200/80 text-xs mt-2 text-center">
              This checks your balance directly from the smart contract
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl ${
            message.includes('Failed') || message.includes('error') || message.includes('Please enter')
              ? 'bg-red-500/20 text-red-100 border border-red-500/30' 
              : 'bg-green-500/20 text-green-100 border border-green-500/30'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}