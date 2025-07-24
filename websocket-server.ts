import { createServer } from 'http'
import { wsServer } from './src/lib/websocket/server'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const port = 3001

const server = createServer()

// Initialize WebSocket server
try {
  wsServer.initialize(server)
  console.log('WebSocket server initialized successfully')
} catch (error) {
  console.error('Failed to initialize WebSocket server:', error)
  process.exit(1)
}

server.listen(port, () => {
  console.log(`> WebSocket server ready on http://localhost:${port}`)
}) 