import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import TronWeb from 'tronweb'

// File-based storage
const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: 'c11d680ad95dcb9913389c924a5608497e31af32b33bce2e00598f5701088b4c'
})

// Contract ABI (matching your actual contract)
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

const contractAddress = 'TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo'

// Helper functions
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'))
  } catch {
    return []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { binanceId: string } }
) {
  try {
    const { binanceId } = params

    if (!binanceId) {
      return NextResponse.json(
        { error: 'Binance ID is required' },
        { status: 400 }
      )
    }

    const users = readUsers()
    const user = users.find(user => user.binanceId === binanceId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let contractBalance = 0
    let blockchainSuccess = false

    try {
      // Get balance from smart contract
      const contract = await tronWeb.contract(contractABI, contractAddress)
      const balance = await contract.balanceOf(user.tronAddress).call()
      contractBalance = balance / 1000000 // Convert from smallest unit to USDT (6 decimals)
      blockchainSuccess = true
      console.log('✅ Contract balance retrieved:', contractBalance)
    } catch (blockchainError) {
      console.error('❌ Failed to get contract balance:', blockchainError)
      // Use local balance as fallback
    }

    return NextResponse.json({
      success: true,
      binanceId: user.binanceId,
      balance: blockchainSuccess ? contractBalance : user.balance,
      tronAddress: user.tronAddress,
      blockchainSuccess,
      localBalance: user.balance,
      contractBalance: contractBalance
    })
  } catch (error) {
    console.error('Balance check error:', error)
    return NextResponse.json(
      { error: 'Failed to check balance: ' + error.message },
      { status: 500 }
    )
  }
}