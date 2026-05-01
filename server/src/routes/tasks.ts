import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()
router.use(authMiddleware)

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    const priority = req.query.priority as string | undefined
    const categoryId = req.query.categoryId as string | undefined

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true, subtasks: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json(tasks)
  } catch (err) {
    console.error('GET /tasks error:', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// POST /api/tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, categoryId } = req.body

    if (!title) return res.status(400).json({ message: 'Le titre est requis' })

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null,
        userId: req.userId as string,
      },
      include: { category: true, subtasks: true },
    })

    res.status(201).json(task)
  } catch (err) {
    console.error('POST /tasks error:', err)
    res.status(500).json({ message: 'Erreur lors de la création de la tâche' })
  }
})

// PUT /api/tasks/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, categoryId } = req.body
    const id = req.params.id as string

    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } })
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' })

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: { category: true, subtasks: true },
    })

    res.json(updated)
  } catch (err) {
    console.error('PUT /tasks/:id error:', err)
    res.status(500).json({ message: 'Erreur lors de la mise à jour' })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } })
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' })

    await prisma.task.delete({ where: { id } })
    res.json({ message: 'Tâche supprimée' })
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err)
    res.status(500).json({ message: 'Erreur lors de la suppression' })
  }
})

// POST /api/tasks/:id/subtasks
router.post('/:id/subtasks', async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body
    const taskId = req.params.id as string

    if (!title) return res.status(400).json({ message: 'Le titre est requis' })

    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } })
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' })

    const subtask = await prisma.subtask.create({ data: { title, taskId } })
    res.status(201).json(subtask)
  } catch (err) {
    console.error('POST subtask error:', err)
    res.status(500).json({ message: 'Erreur lors de la création de la sous-tâche' })
  }
})

// PUT /api/tasks/subtasks/:subtaskId
router.put('/subtasks/:subtaskId', async (req: AuthRequest, res: Response) => {
  try {
    const { title, completed } = req.body
    const id = req.params.subtaskId as string

    const subtask = await prisma.subtask.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(completed !== undefined && { completed }),
      },
    })

    res.json(subtask)
  } catch (err) {
    console.error('PUT subtask error:', err)
    res.status(500).json({ message: 'Erreur lors de la mise à jour' })
  }
})

// DELETE /api/tasks/subtasks/:subtaskId
router.delete('/subtasks/:subtaskId', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.subtaskId as string
    await prisma.subtask.delete({ where: { id } })
    res.json({ message: 'Sous-tâche supprimée' })
  } catch (err) {
    console.error('DELETE subtask error:', err)
    res.status(500).json({ message: 'Erreur lors de la suppression' })
  }
})

export default router
