'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    
    socketInstance.on('connect', () => {
      console.log('Connected to DUSDT transfer server')
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    // Listen for transfer notifications
    socketInstance.on('transfer_sent', (data) => {
      console.log('Transfer sent notification:', data)
    })

    socketInstance.on('transfer_received', (data) => {
      console.log('Transfer received notification:', data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [])

  return socket
}