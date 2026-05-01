import { useState, useEffect } from 'react'
import type { Category, User } from '../types'
import * as api from '../api'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#64748b', '#a78bfa', '#fb7185', '#34d399',
]

interface Props {
  categories: Category[]
  filterCategory: string
  setFilterCategory: (id: string) => void
  onCategoryChange: () => void
  user: User | null
  onLogout: () => void
  open: boolean
  onClose: () => void
  onProfile: () => void
}

export default function Sidebar({ categories, filterCategory, setFilterCategory, onCategoryChange, user, onLogout, open, onClose, onProfile }: Props) {
  const [newCat, setNewCat] = useState({ name: '', color: '#6366f1' })
  const [adding, setAdding] = useState(false)

  // lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCat.name.trim()) return
    await api.createCategory(newCat)
    setNewCat({ name: '', color: '#6366f1' })
    setAdding(false)
    onCategoryChange()
  }

  const handleDeleteCategory = async (id: string) => {
    await api.deleteCategory(id)
    if (filterCategory === id) setFilterCategory('')
    onCategoryChange()
  }

  const handleNavClick = (id: string) => {
    setFilterCategory(id)
    onClose()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <span className="logo-icon">✓</span>
            <span className="logo-text">Task Master</span>
          </div>
          {/* Close button — mobile only */}
          <button className="sidebar-close btn-icon" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <button className="sidebar-user" onClick={() => { onProfile(); onClose(); }}>
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Utilisateur'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${filterCategory === '' ? 'active' : ''}`}
            onClick={() => handleNavClick('')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Toutes les tâches
          </button>
        </nav>

        <div className="sidebar-section">
          <div className="section-header">
            <span>Catégories</span>
            <button className="btn-icon" onClick={() => setAdding(!adding)}>+</button>
          </div>

          {adding && (
            <form onSubmit={handleAddCategory} className="cat-form">
              <input
                type="text"
                placeholder="Nom de la catégorie..."
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                autoFocus
              />
              <div className="color-palette">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${newCat.color === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setNewCat({ ...newCat, color })}
                    title={color}
                  />
                ))}
              </div>
              <button type="submit" className="btn-sm cat-submit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Créer
              </button>
            </form>
          )}

          {categories.map(cat => (
            <div
              key={cat.id}
              className={`cat-item ${filterCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleNavClick(cat.id)}
            >
              <span className="cat-dot" style={{ background: cat.color }} />
              <span className="cat-name">{cat.name}</span>
              <span className="cat-count">{cat._count?.tasks ?? 0}</span>
              <button
                className="cat-delete"
                onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id) }}
              >×</button>
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </aside>
    </>
  )
}
