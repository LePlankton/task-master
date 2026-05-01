import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()
router.use(authMiddleware)

// GET /api/categories
router.get('/', async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'asc' },
  })
  res.json(categories)
})

// POST /api/categories
router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body
  if (!name) return res.status(400).json({ message: 'Le nom est requis' })

  const category = await prisma.category.create({
    data: { name, color: color || '#6366f1', userId: req.userId as string },
  })
  res.status(201).json(category)
})

// PUT /api/categories/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body
  const id = req.params.id as string

  const cat = await prisma.category.findFirst({ where: { id, userId: req.userId } })
  if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' })

  const updated = await prisma.category.update({
    where: { id },
    data: { ...(name && { name }), ...(color && { color }) },
  })
  res.json(updated)
})

// DELETE /api/categories/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  const cat = await prisma.category.findFirst({ where: { id, userId: req.userId } })
  if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' })

  await prisma.category.delete({ where: { id } })
  res.json({ message: 'Catégorie supprimée' })
})

export default router
