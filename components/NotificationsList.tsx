'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Coins } from 'lucide-react'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface NotificationsListProps {
  currentUser: any
}

export default function NotificationsList({ currentUser }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = async () => {
    if (!currentUser?.binanceId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notifications/${currentUser.binanceId}`)
      const result = await response.json()

      if (response.ok) {
        setNotifications(result.notifications)
        setUnreadCount(result.unreadCount)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notificationId,
          binanceId: currentUser.binanceId 
        })
      })

      if (response.ok) {
        loadNotifications()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-8 w-8 text-white" />
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
        </div>
        <p className="text-white/80 text-center py-8">
          Please register first to view notifications
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-white" />
          <h2 className="text-2xl font-bold text-white">USDT Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/80 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/80">No notifications yet</p>
            <p className="text-white/60 text-sm mt-2">Transfer DUSDT to see notifications here</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-xl border-l-4 ${
                notification.isRead
                  ? 'bg-white/5 border-white/20'
                  : 'bg-white/10 border-usdt-green'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-usdt-green" />
                    {notification.title}
                  </h4>
                  <p className="text-white/80 text-sm mb-2">
                    {notification.message}
                  </p>
                  <p className="text-white/60 text-xs">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-5 w-5 text-white/60" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}