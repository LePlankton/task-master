import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Tous les champs sont requis' })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ message: 'Email déjà utilisé' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash } })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Identifiants incorrects' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Identifiants incorrects' })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const { name, email, currentPassword, newPassword } = req.body

  if (!name || !email)
    return res.status(400).json({ message: 'Nom et email requis' })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' })

  // Check email uniqueness (if changed)
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } })
    if (taken) return res.status(409).json({ message: 'Email déjà utilisé' })
  }

  // If changing password, verify current password
  let passwordHash = user.passwordHash
  if (newPassword) {
    if (!currentPassword)
      return res.status(400).json({ message: 'Mot de passe actuel requis' })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid)
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' })
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Le nouveau mot de passe doit faire au moins 6 caractères' })
    passwordHash = await bcrypt.hash(newPassword, 10)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name, email, passwordHash },
  })

  res.json({ user: { id: updated.id, name: updated.name, email: updated.email } })
})

export default router
