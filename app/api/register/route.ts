import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import TronWeb from 'tronweb'

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: 'c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c'
})

// Contract ABI
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "string", "name": "userBinanceId", "type": "string"}],
    "name": "registerBinanceUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const contractAddress = 'TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo'

// File-based storage
const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')
const transfersFile = path.join(dataDir, 'transfers.json')
const notificationsFile = path.join(dataDir, 'notifications.json')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]))
}
if (!fs.existsSync(transfersFile)) {
  fs.writeFileSync(transfersFile, JSON.stringify([]))
}
if (!fs.existsSync(notificationsFile)) {
  fs.writeFileSync(notificationsFile, JSON.stringify([]))
}

// Helper functions
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'))
  } catch {
    return []
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const { binanceId, tronAddress, email } = await request.json()

    // Validate required fields
    if (!binanceId || !tronAddress || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const users = readUsers()

    // Check if user already exists
    const existingUser = users.find(user => 
      user.binanceId === binanceId.trim() || 
      user.tronAddress === tronAddress.trim() || 
      user.email === email.trim().toLowerCase()
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      binanceId: binanceId.trim(),
      tronAddress: tronAddress.trim(),
      email: email.trim().toLowerCase(),
      isVerified: true,
      balance: 1000,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    users.push(newUser)
    writeUsers(users)

    // Register user in smart contract and mint tokens
    let blockchainSuccess = false
    let contractTxHash = ''

    try {
      const contract = await tronWeb.contract(contractABI, contractAddress)
      
      // Register user in contract
      const registerTx = await contract.registerBinanceUser(tronAddress.trim(), binanceId.trim()).send()
      console.log('✅ User registered in contract:', registerTx)
      
      // Mint 1000 DUSDT tokens for the user
      const mintAmount = 1000000000 // 1000 * 10^6 = 1000 USDT with 6 decimals
      const mintTx = await contract.mint(tronAddress.trim(), mintAmount).send()
      console.log('✅ Tokens minted for user:', mintTx)
      
      contractTxHash = mintTx
      blockchainSuccess = true
    } catch (blockchainError) {
      console.error('❌ Failed to register user in contract:', blockchainError)
      // Continue with local registration even if blockchain fails
    }

    return NextResponse.json({
      success: true,
      user: { 
        id: newUser.id,
        binanceId: newUser.binanceId, 
        tronAddress: newUser.tronAddress, 
        email: newUser.email, 
        balance: newUser.balance 
      },
      blockchainSuccess,
      contractTxHash,
      message: blockchainSuccess ? 'User registered and tokens minted on blockchain!' : 'User registered locally (blockchain failed)'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed: ' + error.message },
      { status: 500 }
    )
  }
}