'use client'

import { useState, useEffect } from 'react'
import { Coins, UserPlus, ArrowRightLeft, Wallet, Bell, History } from 'lucide-react'
import RegisterForm from '@/components/RegisterForm'
import TransferForm from '@/components/TransferForm'
import BalanceCard from '@/components/BalanceCard'
import NotificationsList from '@/components/NotificationsList'
import TransferHistory from '@/components/TransferHistory'
import WalletConnection from '@/components/WalletConnection'
import { useSocket } from '@/hooks/useSocket'

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('wallet')
  const [walletAddress, setWalletAddress] = useState('')
  const socket = useSocket()

  useEffect(() => {
    // Load saved user data
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setActiveTab('transfer')
    }
  }, [])

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('join_room', currentUser.binanceId)
    }
  }, [socket, currentUser])

  const handleUserRegistered = (user) => {
    setCurrentUser(user)
    setActiveTab('transfer')
  }

  const handleWalletConnected = (address) => {
    setWalletAddress(address)
    setActiveTab('register')
  }

  const tabs = [
    { id: 'wallet', label: 'Connect Wallet', icon: Wallet },
    { id: 'register', label: 'Register', icon: UserPlus },
    { id: 'transfer', label: 'Transfer USDT', icon: ArrowRightLeft },
    { id: 'balance', label: 'Balance', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'history', label: 'History', icon: History },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center py-8 text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Coins className="h-12 w-12 text-yellow-400" />
          <h1 className="text-4xl font-bold">USDT Transfer System</h1>
        </div>
        <p className="text-xl opacity-90">Transfer Demo USDT tokens between Binance IDs with real-time notifications</p>
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto">
          <p className="text-sm text-yellow-200">
            <strong>Demo Features:</strong> Transfer USDT with any value (including 0), 
            Real-time notifications, Binance ID integration, No trading/withdrawal restrictions
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-usdt-green shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {activeTab === 'wallet' && (
              <WalletConnection onWalletConnected={handleWalletConnected} />
            )}
            
            {activeTab === 'register' && (
              <RegisterForm onUserRegistered={handleUserRegistered} walletAddress={walletAddress} />
            )}
            
            {activeTab === 'transfer' && (
              <TransferForm currentUser={currentUser} />
            )}
            
            {activeTab === 'balance' && (
              <BalanceCard currentUser={currentUser} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {activeTab === 'notifications' && (
              <NotificationsList currentUser={currentUser} />
            )}
            
            {activeTab === 'history' && (
              <TransferHistory currentUser={currentUser} />
            )}
          </div>
        </div>

        {/* Show both notifications and history when on transfer tab */}
        {activeTab === 'transfer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <NotificationsList currentUser={currentUser} />
            <TransferHistory currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}