const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocket } = require('./lib/socket')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io for real-time DUSDT notifications
  initSocket(server)

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🚀 DUSDT Transfer System running on http://${hostname}:${port}`)
      console.log(`📱 Real-time notifications enabled`)
      console.log(`💰 Demo USDT (DUSDT) transfers ready`)
    })
})