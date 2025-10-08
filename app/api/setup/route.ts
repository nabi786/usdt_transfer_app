import { NextRequest, NextResponse } from 'next/server'
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
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

const contractAddress = 'TYP2iw5G5ktPiSRK6gQ8V8jfXeM6vkzVMK'

export async function POST(request: NextRequest) {
  try {
    const { binanceId, tronAddress } = await request.json()

    if (!binanceId || !tronAddress) {
      return NextResponse.json(
        { error: 'Binance ID and Tron Address are required' },
        { status: 400 }
      )
    }

    console.log('🔧 Setting up user in contract:', binanceId, tronAddress)

    const contract = await tronWeb.contract(contractABI, contractAddress)
    
    // Step 1: Register user in contract
    console.log('📝 Registering user in contract...')
    const registerTx = await contract.registerBinanceUser(tronAddress, binanceId).send()
    console.log('✅ User registered:', registerTx)

    // Step 2: Mint 1000 DUSDT tokens for the user
    console.log('💰 Minting 1000 DUSDT tokens...')
    const mintAmount = tronWeb.toBigNumber(1000).times(1000000) // 1000 USDT with 6 decimals
    const mintTx = await contract.mint(tronAddress, mintAmount).send()
    console.log('✅ Tokens minted:', mintTx)

    // Step 3: Check balance
    console.log('🔍 Checking balance...')
    const balance = await contract.balanceOf(tronAddress).call()
    const balanceInUSDT = balance / 1000000
    console.log('✅ Contract balance:', balanceInUSDT, 'USDT')

    return NextResponse.json({
      success: true,
      message: 'User setup completed successfully!',
      transactions: {
        registration: registerTx,
        minting: mintTx
      },
      balance: balanceInUSDT,
      binanceId,
      tronAddress
    })

  } catch (error) {
    console.error('❌ Setup error:', error)
    return NextResponse.json(
      { 
        error: 'Setup failed: ' + error.message,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
