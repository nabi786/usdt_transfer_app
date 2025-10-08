'use client'

import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

interface WalletConnectionProps {
  onWalletConnected: (address: string) => void
}

declare global {
  interface Window {
    tronWeb?: any
  }
}

export default function WalletConnection({ onWalletConnected }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState(false)
  const [network, setNetwork] = useState('')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    // Wait for TronLink to load
    const checkTronLink = () => {
      console.log('🔍 Checking TronLink...')
      console.log('window.tronWeb exists:', !!window.tronWeb)
      console.log('window.tronWeb.ready:', window.tronWeb?.ready)
      
      if (typeof window !== 'undefined' && window.tronWeb) {
        console.log('✅ TronLink extension found!')
        setIsTronLinkInstalled(true)
        
        if (window.tronWeb.ready) {
          console.log('✅ TronLink is ready!')
          checkConnection()
        } else {
          console.log('⏳ TronLink found but not ready yet, waiting...')
          // Wait longer for TronLink to be ready
          setTimeout(() => {
            if (window.tronWeb && window.tronWeb.ready) {
              console.log('✅ TronLink became ready after delay!')
              checkConnection()
            } else {
              console.log('⏳ TronLink still not ready, but extension is detected')
            }
          }, 2000)
        }
      } else {
        console.log('❌ TronLink not found')
        setIsTronLinkInstalled(false)
      }
    }

    // Check immediately
    checkTronLink()

    // Check multiple times with increasing delays
    const timers = [
      setTimeout(checkTronLink, 500),
      setTimeout(checkTronLink, 1000),
      setTimeout(checkTronLink, 2000),
      setTimeout(checkTronLink, 3000),
      setTimeout(checkTronLink, 5000)
    ]

    // Listen for TronLink events
    const handleTronLinkReady = () => {
      console.log('TronLink initialized event received')
      setIsTronLinkInstalled(true)
      checkConnection()
    }

    // Listen for window load event
    const handleWindowLoad = () => {
      console.log('Window loaded, checking TronLink again')
      checkTronLink()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('tronLink#initialized', handleTronLinkReady)
      window.addEventListener('load', handleWindowLoad)
      
      // Also check when DOM is ready
      if (document.readyState === 'complete') {
        checkTronLink()
      } else {
        document.addEventListener('DOMContentLoaded', checkTronLink)
      }
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer))
      if (typeof window !== 'undefined') {
        window.removeEventListener('tronLink#initialized', handleTronLinkReady)
        window.removeEventListener('load', handleWindowLoad)
        document.removeEventListener('DOMContentLoaded', checkTronLink)
      }
    }
  }, [])

  const checkTronLink = () => {
    console.log('Checking TronLink...')
    console.log('window.tronWeb:', window.tronWeb)
    console.log('window.tronWeb?.ready:', window.tronWeb?.ready)
    
    const debug = `TronLink Check:
- window.tronWeb exists: ${!!window.tronWeb}
- window.tronWeb.ready: ${window.tronWeb?.ready}
- window.tronWeb.defaultAddress: ${window.tronWeb?.defaultAddress?.base58 || 'None'}
- typeof window: ${typeof window}
- User agent: ${navigator.userAgent}`
    
    setDebugInfo(debug)
    
    // Check if TronLink exists (even if not ready)
    if (typeof window !== 'undefined' && window.tronWeb) {
      console.log('TronLink found!')
      setIsTronLinkInstalled(true)
      
      // If ready, check connection
      if (window.tronWeb.ready) {
        console.log('TronLink is ready!')
        checkConnection()
      } else {
        console.log('TronLink found but not ready yet')
        // Don't set as not installed, just wait for it to be ready
      }
    } else {
      console.log('TronLink not found')
      setIsTronLinkInstalled(false)
    }
  }

  const checkConnection = async () => {
    try {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        const address = window.tronWeb.defaultAddress.base58
        const network = window.tronWeb.fullNode.host.includes('shasta') ? 'Shasta Testnet' : 'Mainnet'
        
        setWalletAddress(address)
        setNetwork(network)
        setIsConnected(true)
        onWalletConnected(address)
        
        // Get balance
        const balance = await window.tronWeb.trx.getBalance(address)
        setBalance(balance / 1000000) // Convert from sun to TRX
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

  const connectWallet = async () => {
    try {
      setLoading(true)
      
      if (!isTronLinkInstalled) {
        alert('TronLink not detected. Please install TronLink extension first.')
        return
      }

      // Check if TronLink exists first
      if (!window.tronWeb) {
        alert('TronLink not found. Please make sure the extension is installed and enabled.')
        return
      }

      // Wait for TronLink to be ready with timeout
      let attempts = 0
      const maxAttempts = 20 // 10 seconds total
      
      while (!window.tronWeb.ready && attempts < maxAttempts) {
        console.log(`⏳ Waiting for TronLink to be ready... (attempt ${attempts + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      }

      if (!window.tronWeb.ready) {
        alert('TronLink is taking too long to initialize. Please try:\n1. Unlock your TronLink wallet\n2. Refresh the page\n3. Make sure TronLink is on Shasta Testnet')
        return
      }

      console.log('✅ TronLink is ready, proceeding with connection...')

      const address = window.tronWeb.defaultAddress?.base58
      if (address) {
        const network = window.tronWeb.fullNode.host.includes('shasta') ? 'Shasta Testnet' : 'Mainnet'
        
        setWalletAddress(address)
        setNetwork(network)
        setIsConnected(true)
        onWalletConnected(address)
        
        // Get balance
        try {
          const balance = await window.tronWeb.trx.getBalance(address)
          setBalance(balance / 1000000)
          console.log('✅ Wallet connected successfully!')
        } catch (balanceError) {
          console.error('Error getting balance:', balanceError)
          setBalance(0)
        }
      } else {
        alert('No wallet address found. Please make sure TronLink is unlocked and you have an account.')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Error connecting wallet: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const refreshConnection = () => {
    console.log('Manual refresh triggered')
    checkTronLink()
  }

  const forceDetectTronLink = () => {
    console.log('🔧 Force detecting TronLink...')
    
    // Try multiple detection methods
    if (typeof window !== 'undefined') {
      // Method 1: Check window.tronWeb (even if not ready)
      if (window.tronWeb) {
        console.log('✅ Found window.tronWeb')
        setIsTronLinkInstalled(true)
        if (window.tronWeb.ready) {
          console.log('✅ TronLink is ready!')
          checkConnection()
        } else {
          console.log('⏳ TronLink not ready, waiting...')
          // Try to wait for it to be ready
          const checkReady = () => {
            if (window.tronWeb && window.tronWeb.ready) {
              console.log('✅ TronLink became ready!')
              checkConnection()
            } else {
              setTimeout(checkReady, 500)
            }
          }
          checkReady()
        }
        return
      }
      
      // Method 2: Check for TronLink in extensions
      if ((window as any).chrome && (window as any).chrome.runtime) {
        console.log('Checking Chrome extensions...')
        // This won't work due to security, but we can try
      }
      
      // Method 3: Check for TronLink events
      console.log('Listening for TronLink events...')
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.message && event.data.message.action === 'setAccount') {
          console.log('TronLink message received')
          setIsTronLinkInstalled(true)
          window.removeEventListener('message', handleMessage)
        }
      }
      window.addEventListener('message', handleMessage)
      
      // Method 4: Try to access TronLink directly with multiple attempts
      const attempts = [500, 1000, 2000, 3000, 5000]
      attempts.forEach(delay => {
        setTimeout(() => {
          if (window.tronWeb) {
            console.log(`TronLink found after ${delay}ms`)
            setIsTronLinkInstalled(true)
            if (window.tronWeb.ready) {
              checkConnection()
            }
          }
        }, delay)
      })
      
      // Method 5: Try to trigger TronLink initialization
      try {
        if (window.tronWeb && typeof window.tronWeb.request === 'function') {
          console.log('Trying to trigger TronLink request...')
          window.tronWeb.request({ method: 'tron_requestAccounts' })
        }
      } catch (e) {
        console.log('Could not trigger TronLink request:', e)
      }
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress('')
    setNetwork('')
    setBalance(0)
  }

  if (!isTronLinkInstalled) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">TronLink Wallet Required</h3>
        <p className="text-yellow-200 mb-4">
          To use this USDT transfer system, you need to install TronLink wallet extension.
        </p>
        <div className="space-y-3">
          <a
            href="https://www.tronlink.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            Install TronLink Wallet
          </a>
          <div className="space-y-2">
            <button
              onClick={refreshConnection}
              className="block mx-auto text-sm text-yellow-200 hover:text-white underline"
            >
              Already installed? Click here to refresh
            </button>
            <button
              onClick={forceDetectTronLink}
              className="block mx-auto text-sm text-yellow-300 hover:text-white underline"
            >
              Force detect TronLink
            </button>
          </div>
        </div>
        <p className="text-yellow-100 text-sm mt-4">
          After installation, refresh this page and connect your wallet.
        </p>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <h4 className="text-yellow-200 font-bold mb-2">Debug Info:</h4>
            <pre className="text-yellow-100 text-xs whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
          <h4 className="text-blue-200 font-bold mb-2">Quick Test:</h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('🔍 Manual TronLink test:')
                console.log('window:', typeof window)
                console.log('window.tronWeb:', window.tronWeb)
                console.log('window.tronWeb?.ready:', window.tronWeb?.ready)
                console.log('window.tronWeb?.defaultAddress:', window.tronWeb?.defaultAddress)
                alert(`TronLink Test:\n- Exists: ${!!window.tronWeb}\n- Ready: ${window.tronWeb?.ready}\n- Address: ${window.tronWeb?.defaultAddress?.base58 || 'None'}`)
              }}
              className="block text-blue-200 hover:text-white underline text-sm"
            >
              Click to test TronLink in console
            </button>
            <button
              onClick={() => {
                // Try to access TronLink directly
                if (window.tronWeb) {
                  alert('TronLink found! Ready: ' + window.tronWeb.ready)
                } else {
                  alert('TronLink not found. Make sure extension is installed and enabled.')
                }
              }}
              className="block text-blue-200 hover:text-white underline text-sm"
            >
              Direct TronLink check
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
        <Wallet className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-blue-200 mb-4">
          Connect your TronLink wallet to start transferring USDT tokens.
        </p>
        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              'Connect TronLink Wallet'
            )}
          </button>
          <button
            onClick={refreshConnection}
            className="block mx-auto text-sm text-blue-200 hover:text-white underline"
          >
            Not working? Try refreshing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Wallet Connected</h3>
            <p className="text-green-200 text-sm">{network}</p>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="text-green-200 hover:text-white text-sm underline"
        >
          Disconnect
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-white/80">Address:</span>
          <span className="text-white font-mono text-sm">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Balance:</span>
          <span className="text-white font-bold">{balance.toFixed(2)} TRX</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Network:</span>
          <span className="text-white">{network}</span>
        </div>
      </div>
      
      {network !== 'Shasta Testnet' && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            ⚠️ Please switch to Shasta Testnet for testing. Current network: {network}
          </p>
        </div>
      )}
    </div>
  )
}
