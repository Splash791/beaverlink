import { createServer } from 'node:http'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'

const PORT = 3000
const authHandler = toNodeHandler(auth)

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname

  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  if (pathname.startsWith('/api/auth/')) {
    try {
      await authHandler(req, res)
    } catch (error) {
      console.error('Authentication request failed:', error)

      if (!res.headersSent) {
        res.writeHead(500)
        res.end('Internal Server Error')
      } else {
        res.destroy()
      }
    }
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Auth service running at http://localhost:${PORT}`)
})