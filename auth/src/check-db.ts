import { pool } from './db.js'

try {
  await pool.query('SELECT 1')
  console.log('Successfully connected to PostgreSQL!')
} catch (error) {
  console.error('Database connection failed:', error)
  process.exitCode = 1
} finally {
  await pool.end()
}