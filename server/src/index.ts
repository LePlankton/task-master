import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import categoryRoutes from './routes/categories'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/categories', categoryRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`)
})
