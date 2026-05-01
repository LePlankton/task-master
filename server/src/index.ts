import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import categoryRoutes from './routes/categories'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/categories', categoryRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`)
})
