import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Task, Category, TaskStatus } from '../types'
import * as api from '../api'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import Sidebar from '../components/Sidebar'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.getTasks({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        categoryId: filterCategory || undefined,
      })
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [filterStatus, filterPriority, filterCategory])

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories()
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    Promise.all([fetchTasks(), fetchCategories()]).finally(() => setLoading(false))
  }, [fetchTasks])

  const handleDelete = async (id: string) => {
    await api.deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    const res = await api.updateTask(id, { status })
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
  }

  const handleSaved = (task: Task) => {
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
    } else {
      setTasks(prev => [task, ...prev])
    }
    setShowModal(false)
    setEditTask(null)
  }

  // Client-side search filter
  const visibleTasks = search.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  }

  return (
    <div className="dashboard">
      <Sidebar
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        onCategoryChange={fetchCategories}
        user={user}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onProfile={() => navigate('/profile')}
      />

      <main className="main-content">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <span className="mobile-logo">Task Master</span>
          <button className="btn-primary mobile-new-btn" onClick={() => { setEditTask(null); setShowModal(true) }}>
            +
          </button>
        </div>

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>Bonjour, {user?.name || 'toi'} 👋</h1>
            <p className="dash-sub">{stats.total} tâche{stats.total > 1 ? 's' : ''} au total</p>
          </div>
          <button className="btn-primary desktop-new-btn" onClick={() => { setEditTask(null); setShowModal(true) }}>
            + Nouvelle tâche
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { label: 'À faire', value: stats.todo, color: '#6366f1' },
            { label: 'En cours', value: stats.inProgress, color: '#f59e0b' },
            { label: 'Terminées', value: stats.done, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="search-filters">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher une tâche..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <div className="filters-row">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminées</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">Toutes priorités</option>
              <option value="HIGH">Haute</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LOW">Basse</option>
            </select>
          </div>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            {search ? (
              <p>Aucune tâche ne correspond à "<strong>{search}</strong>".</p>
            ) : (
              <>
                <p>Aucune tâche pour l'instant.</p>
                <button className="btn-primary" onClick={() => setShowModal(true)}>Créer une tâche</button>
              </>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {visibleTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onEdit={(t) => { setEditTask(t); setShowModal(true) }}
                onUpdate={fetchTasks}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editTask}
          categories={categories}
          onSaved={handleSaved}
          onClose={() => { setShowModal(false); setEditTask(null) }}
        />
      )}
    </div>
  )
}
