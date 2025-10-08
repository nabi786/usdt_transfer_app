import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
// @ts-ignore - TronWeb types are defined in types/tronweb.d.ts
import TronWeb from 'tronweb'

// File-based storage
const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')
const transfersFile = path.join(dataDir, 'transfers.json')
const notificationsFile = path.join(dataDir, 'notifications.json')

// Type definitions
interface User {
  id: number
  binanceId: string
  tronAddress: string
  email: string
  isVerified: boolean
  balance: number
  createdAt: string
  lastActive: string
}

interface Transfer {
  id: number
  fromBinanceId: string
  toBinanceId: string
  fromTronAddress: string
  toTronAddress: string
  amount: number
  transactionHash: string
  status: string
  createdAt: string
  completedAt: string | null
}

// Helper functions
function readUsers(): User[] {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'))
  } catch {
    return []
  }
}

function writeUsers(users: User[]): void {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

function readTransfers(): Transfer[] {
  try {
    return JSON.parse(fs.readFileSync(transfersFile, 'utf8'))
  } catch {
    return []
  }
}

function writeTransfers(transfers: Transfer[]): void {
  fs.writeFileSync(transfersFile, JSON.stringify(transfers, null, 2))
}

interface Notification {
  id: number
  userId?: number
  binanceId: string
  type: string
  title: string
  message: string
  amount?: number
  fromBinanceId?: string
  toBinanceId?: string
  transactionHash?: string
  transferId?: number
  isRead: boolean
  isEmailSent?: boolean
  createdAt: string
}

function readNotifications(): Notification[] {
  try {
    return JSON.parse(fs.readFileSync(notificationsFile, 'utf8'))
  } catch {
    return []
  }
}

function writeNotifications(notifications: Notification[]): void {
  fs.writeFileSync(notificationsFile, JSON.stringify(notifications, null, 2))
}

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: 'c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c'
})

// Contract ABI (matching your actual contract)
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "string", "name": "userBinanceId", "type": "string"}],
    "name": "registerBinanceUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
    "name": "transferZero",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const contractAddress = 'TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo'

export async function POST(request: NextRequest) {
  try {
    const { fromBinanceId, toBinanceId, amount } = await request.json()

    // Validate required fields
    if (!fromBinanceId || !toBinanceId || amount === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate amount (can be 0 as requested)
    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount cannot be negative' },
        { status: 400 }
      )
    }

    const users = readUsers()

    // Check if users exist
    const fromUser = users.find(user => user.binanceId === fromBinanceId)
    const toUser = users.find(user => user.binanceId === toBinanceId)

    if (!fromUser || !toUser) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 400 }
      )
    }

    // Check if sender has sufficient balance (only if amount > 0)
    if (amount > 0 && fromUser.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    let transactionHash = ''
    let blockchainSuccess = false

    try {
      // Initialize contract
      const contract = await tronWeb.contract(contractABI, contractAddress)
      
      // First, register both users in the contract if they're not already registered
      try {
        await contract.registerBinanceUser(fromUser.tronAddress, fromUser.binanceId).send()
        console.log('✅ Registered sender in contract:', fromUser.binanceId)
      } catch (regError) {
        const errorMessage = regError instanceof Error ? regError.message : 'Unknown error'
        console.log('ℹ️ Sender might already be registered:', errorMessage)
      }

      try {
        await contract.registerBinanceUser(toUser.tronAddress, toUser.binanceId).send()
        console.log('✅ Registered receiver in contract:', toUser.binanceId)
      } catch (regError) {
        const errorMessage = regError instanceof Error ? regError.message : 'Unknown error'
        console.log('ℹ️ Receiver might already be registered:', errorMessage)
      }
      
      // Convert amount to contract units (6 decimals)
      const contractAmount = Math.floor(amount * 1000000)
      
      // Execute transfer on blockchain
      let transaction
      if (amount === 0) {
        // Use transferZero for 0 amount transfers
        transaction = await contract.transferZero(toUser.tronAddress).send()
      } else {
        // Use regular transfer for non-zero amounts
        transaction = await contract.transfer(toUser.tronAddress, contractAmount).send()
      }
      
      transactionHash = transaction
      blockchainSuccess = true
      
      console.log('✅ Blockchain transaction successful:', transactionHash)
    } catch (blockchainError) {
      console.error('❌ Blockchain transaction failed:', blockchainError)
      // Continue with local transfer even if blockchain fails
    }

    // Create transfer record
    const transfers = readTransfers()
    const localTransferHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newTransfer = {
      id: transfers.length + 1,
      fromBinanceId,
      toBinanceId,
      fromTronAddress: fromUser.tronAddress,
      toTronAddress: toUser.tronAddress,
      amount,
      transactionHash: transactionHash || localTransferHash,
      status: blockchainSuccess ? 'completed' : 'pending',
      createdAt: new Date().toISOString(),
      completedAt: blockchainSuccess ? new Date().toISOString() : null
    }

    transfers.push(newTransfer)
    writeTransfers(transfers)

    // Update user balances (only if amount > 0)
    if (amount > 0) {
      fromUser.balance -= amount
      toUser.balance += amount
      writeUsers(users)
    }

    // Create notifications
    const notifications = readNotifications()
    
    // Sender notification
    notifications.push({
      id: notifications.length + 1,
      userId: fromUser.id,
      binanceId: fromUser.binanceId,
      type: 'transfer_sent',
      title: 'USDT Transfer Sent',
      message: `You have successfully sent ${amount} USDT to ${toBinanceId}${blockchainSuccess ? ' (Blockchain confirmed)' : ' (Local only)'}`,
      transferId: newTransfer.id,
      isRead: false,
      isEmailSent: false,
      createdAt: new Date().toISOString()
    })

    // Receiver notification
    notifications.push({
      id: notifications.length + 2,
      userId: toUser.id,
      binanceId: toUser.binanceId,
      type: 'transfer_received',
      title: 'USDT Transfer Received',
      message: `You have received ${amount} USDT from ${fromBinanceId}${blockchainSuccess ? ' (Blockchain confirmed)' : ' (Local only)'}`,
      transferId: newTransfer.id,
      isRead: false,
      isEmailSent: false,
      createdAt: new Date().toISOString()
    })

    writeNotifications(notifications)

    return NextResponse.json({
      success: true,
      transactionHash: transactionHash || localTransferHash,
      transferId: newTransfer.id,
      blockchainSuccess,
      message: `Successfully transferred ${amount} USDT from ${fromBinanceId} to ${toBinanceId}${blockchainSuccess ? ' (Blockchain confirmed)' : ' (Local only)'}`
    })
  } catch (error) {
    console.error('Transfer error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Transfer failed: ' + errorMessage },
      { status: 500 }
    )
  }
}