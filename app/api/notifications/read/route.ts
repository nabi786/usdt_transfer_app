import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Notification from '@/lib/models/Notification'

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trc20_demo')
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { notificationId, binanceId } = await request.json()

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, binanceId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}