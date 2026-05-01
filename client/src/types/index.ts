export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface User {
  id: string
  name: string
  email: string
}

export interface Category {
  id: string
  name: string
  color: string
  _count?: { tasks: number }
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  taskId: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: string
  categoryId?: string
  category?: Category
  subtasks: Subtask[]
  createdAt: string
}
