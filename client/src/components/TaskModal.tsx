import { useState, useEffect } from 'react'
import type { Task, Category } from '../types'
import * as api from '../api'

interface Props {
  task: Task | null
  categories: Category[]
  onSaved: (task: Task) => void
  onClose: () => void
}

export default function TaskModal({ task, categories, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    categoryId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        categoryId: task.categoryId || '',
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Le titre est requis'); return }
    setLoading(true)
    try {
      const data = {
        ...form,
        dueDate: form.dueDate || null,
        categoryId: form.categoryId || null,
      }
      const res = task
        ? await api.updateTask(task.id, data)
        : await api.createTask(data)
      onSaved(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button className="btn-icon" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Finir le projet..."
              autoFocus
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Détails optionnels..."
              rows={3}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Priorité</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">🟢 Basse</option>
                <option value="MEDIUM">🟡 Moyenne</option>
                <option value="HIGH">🔴 Haute</option>
              </select>
            </div>

            <div className="field">
              <label>Catégorie</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Aucune</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Date d'échéance</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sauvegarde...' : task ? 'Modifier →' : 'Créer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
