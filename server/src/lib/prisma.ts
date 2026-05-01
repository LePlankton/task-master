import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
  }),
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

export default prisma
