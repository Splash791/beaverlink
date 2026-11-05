import 'dotenv/config'
import { Pool } from 'pg'
import { readFileSync } from 'node:fs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  ssl: {
    ca: readFileSync(
      new URL('../certs/supabase-ca.crt', import.meta.url),
      'utf8'
    ),
    rejectUnauthorized: true,
  },
})