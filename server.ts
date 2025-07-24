import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { wsServer } from './src/lib/websocket/server'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Prepare the Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize WebSocket server
  try {
    wsServer.initialize(server)
    console.log('WebSocket server initialized successfully')
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error)
    console.log('Continuing without WebSocket support...')
  }

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
}) 