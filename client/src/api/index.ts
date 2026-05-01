import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data)

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

export const updateProfile = (data: { name: string; email: string; currentPassword?: string; newPassword?: string }) =>
  api.put('/auth/profile', data)

// Tasks
export const getTasks = (filters?: { status?: string; priority?: string; categoryId?: string }) =>
  api.get('/tasks', { params: filters })

export const createTask = (data: object) => api.post('/tasks', data)
export const updateTask = (id: string, data: object) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`)

// Subtasks
export const createSubtask = (taskId: string, title: string) =>
  api.post(`/tasks/${taskId}/subtasks`, { title })

export const updateSubtask = (subtaskId: string, data: object) =>
  api.put(`/tasks/subtasks/${subtaskId}`, data)

export const deleteSubtask = (subtaskId: string) =>
  api.delete(`/tasks/subtasks/${subtaskId}`)

// Categories
export const getCategories = () => api.get('/categories')
export const createCategory = (data: { name: string; color: string }) =>
  api.post('/categories', data)
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`)
