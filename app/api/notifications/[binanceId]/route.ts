import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File-based storage
const dataDir = path.join(process.cwd(), 'data')
const notificationsFile = path.join(dataDir, 'notifications.json')

// Helper functions
function readNotifications() {
  try {
    return JSON.parse(fs.readFileSync(notificationsFile, 'utf8'))
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

    const notifications = readNotifications()
    const userNotifications = notifications
      .filter(notif => notif.binanceId === binanceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)

    return NextResponse.json({
      success: true,
      notifications: userNotifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.isRead,
        createdAt: notif.createdAt
      }))
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications: ' + error.message },
      { status: 500 }
    )
  }
}