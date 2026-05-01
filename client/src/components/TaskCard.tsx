import { useState } from 'react'
import type { Task, TaskStatus } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import * as api from '../api'

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
}

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'Haute',
  MEDIUM: 'Moyenne',
  LOW: 'Basse',
}

const STATUS_LABELS: Record<string, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
}

interface Props {
  task: Task
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onUpdate: () => void
}

export default function TaskCard({ task, onDelete, onStatusChange, onEdit, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtask.trim()) return
    await api.createSubtask(task.id, newSubtask)
    setNewSubtask('')
    onUpdate()
  }

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    await api.updateSubtask(subtaskId, { completed: !completed })
    onUpdate()
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    await api.deleteSubtask(subtaskId)
    onUpdate()
  }

  const completedCount = task.subtasks.filter(s => s.completed).length
  const isDone = task.status === 'DONE'
  const isOverdue = !isDone && task.dueDate
    ? new Date(task.dueDate) < new Date(new Date().toDateString())
    : false

  return (
    <div className={`task-card ${isDone ? 'task-done' : ''} ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-top">
        <div className="task-check-title">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onStatusChange(task.id, isDone ? 'TODO' : 'DONE')}
            className="task-checkbox"
          />
          <span className={`task-title ${isDone ? 'line-through' : ''}`}>{task.title}</span>
        </div>
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="btn-icon" title="Modifier">✏️</button>
          <button onClick={() => onDelete(task.id)} className="btn-icon btn-danger" title="Supprimer">🗑️</button>
          <button onClick={() => setExpanded(!expanded)} className="btn-icon">
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <div className="task-meta">
        <span className="priority-badge" style={{ color: PRIORITY_COLORS[task.priority] }}>
          ● {PRIORITY_LABELS[task.priority]}
        </span>
        <span className="status-badge">{STATUS_LABELS[task.status]}</span>
        {task.category && (
          <span className="cat-badge" style={{ background: task.category.color + '22', color: task.category.color }}>
            {task.category.name}
          </span>
        )}
        {task.dueDate && (
          <span className={`due-date ${isOverdue ? 'due-date-overdue' : ''}`}>
            {isOverdue ? '⚠️' : '📅'} {format(new Date(task.dueDate), 'd MMM yyyy', { locale: fr })}
            {isOverdue && <span className="overdue-label">En retard</span>}
          </span>
        )}
        {task.subtasks.length > 0 && (
          <span className="subtask-count">
            ✓ {completedCount}/{task.subtasks.length}
          </span>
        )}
      </div>

      {task.description && !expanded && (
        <p className="task-desc">{task.description}</p>
      )}

      {expanded && (
        <div className="task-expanded">
          {task.description && <p className="task-desc">{task.description}</p>}

          <div className="subtasks">
            <p className="subtasks-title">Sous-tâches</p>
            {task.subtasks.map(s => (
              <div key={s.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={s.completed}
                  onChange={() => handleSubtaskToggle(s.id, s.completed)}
                />
                <span className={s.completed ? 'line-through' : ''}>{s.title}</span>
                <button onClick={() => handleDeleteSubtask(s.id)} className="btn-icon btn-danger-sm">×</button>
              </div>
            ))}
            <form onSubmit={handleAddSubtask} className="subtask-form">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="Ajouter une sous-tâche..."
              />
              <button type="submit" className="btn-sm">+</button>
            </form>
          </div>

          <div className="task-status-row">
            {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(s => (
              <button
                key={s}
                className={`status-btn ${task.status === s ? 'active' : ''}`}
                onClick={() => onStatusChange(task.id, s)}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
