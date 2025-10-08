'use client'

import { useState, useEffect } from 'react'
import { History, ArrowUpRight, ArrowDownLeft, Coins } from 'lucide-react'

interface Transfer {
  _id: string
  fromBinanceId: string
  toBinanceId: string
  amount: number
  status: string
  transactionHash: string
  createdAt: string
}

interface TransferHistoryProps {
  currentUser: any
}

export default function TransferHistory({ currentUser }: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(false)
  const [binanceId, setBinanceId] = useState(currentUser?.binanceId || '')

  const loadTransferHistory = async () => {
    if (!binanceId) {
      setTransfers([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/transfers/${binanceId}`)
      const result = await response.json()

      if (response.ok) {
        setTransfers(result.transfers)
      }
    } catch (error) {
      console.error('Error loading transfer history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.binanceId) {
      setBinanceId(currentUser.binanceId)
      loadTransferHistory()
    }
  }, [currentUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(6)
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-8 w-8 text-white" />
        <h2 className="text-2xl font-bold text-white">USDT Transfer History</h2>
      </div>

      {/* Binance ID Input */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          View History for Binance ID
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
            onClick={loadTransferHistory}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>

      {/* Transfer List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/80 mt-2">Loading history...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/80">No transfer history yet</p>
            <p className="text-white/60 text-sm mt-2">Transfer DUSDT to see history here</p>
          </div>
        ) : (
          transfers.map((transfer) => {
            const isSent = transfer.fromBinanceId === binanceId
            const otherParty = isSent ? transfer.toBinanceId : transfer.fromBinanceId
            const amount = formatAmount(transfer.amount)
            
            return (
              <div
                key={transfer._id}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isSent ? (
                      <ArrowUpRight className="h-5 w-5 text-red-400" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-green-400" />
                    )}
                    <span className="text-white font-medium">
                      {isSent ? 'Sent to' : 'Received from'}: {otherParty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(transfer.status)}`}></div>
                    <span className="text-white/60 text-sm capitalize">
                      {transfer.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Amount:</span>
                    <span className={`ml-2 font-medium ${
                      isSent ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {isSent ? '-' : '+'}{amount} USDT
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Time:</span>
                    <span className="ml-2 text-white/80">
                      {new Date(transfer.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {transfer.transactionHash && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/60 text-sm">TX:</span>
                    <span className="ml-2 text-white/80 text-sm font-mono">
                      {transfer.transactionHash.slice(0, 20)}...
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}