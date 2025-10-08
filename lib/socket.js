const { Server } = require('socket.io')
const http = require('http')

let io

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected to DUSDT transfer system:', socket.id)

    socket.on('join_room', (binanceId) => {
      socket.join(binanceId)
      console.log(`User ${binanceId} joined room for DUSDT notifications`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

module.exports = { initSocket, getIO }