import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File-based storage
const dataDir = path.join(process.cwd(), 'data')
const transfersFile = path.join(dataDir, 'transfers.json')

// Helper functions
function readTransfers() {
  try {
    return JSON.parse(fs.readFileSync(transfersFile, 'utf8'))
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

    const transfers = readTransfers()
    const userTransfers = transfers
      .filter(transfer => transfer.fromBinanceId === binanceId || transfer.toBinanceId === binanceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)

    return NextResponse.json({
      success: true,
      transfers: userTransfers.map(transfer => ({
        id: transfer.id,
        fromBinanceId: transfer.fromBinanceId,
        toBinanceId: transfer.toBinanceId,
        amount: transfer.amount,
        transactionHash: transfer.transactionHash,
        status: transfer.status,
        createdAt: transfer.createdAt,
        type: transfer.fromBinanceId === binanceId ? 'sent' : 'received'
      }))
    })
  } catch (error) {
    console.error('Transfer history error:', error)
    return NextResponse.json(
      { error: 'Failed to get transfer history: ' + error.message },
      { status: 500 }
    )
  }
}