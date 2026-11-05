import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins'
import { PostgresDialect } from 'kysely'
import { pool } from './db.js'

export const auth = betterAuth({
  database: {
    dialect: new PostgresDialect({ pool }),
    type: 'postgres',
    schemaName: 'better_auth',
  },

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: ['http://localhost:5173'],

  plugins: [jwt()],
})