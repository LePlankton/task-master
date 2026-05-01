import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../api'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const payload: any = { name: form.name, email: form.email }
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }
      const res = await api.updateProfile(payload)
      updateUser(res.data.user)
      setSuccess('Profil mis à jour avec succès !')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </button>
          <h1>Mon profil</h1>
        </div>

        {/* Avatar */}
        <div className="profile-avatar-block">
          <div className="profile-avatar">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email-display">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-section-title">Informations générales</div>

          <div className="field">
            <label>Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="profile-section-title" style={{ marginTop: '1.5rem' }}>
            Changer le mot de passe
            <span className="optional-label">optionnel</span>
          </div>

          <div className="field">
            <label>Mot de passe actuel</label>
            <div className="input-password">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Requis uniquement si changement"
              />
              <button type="button" className="eye-btn" onClick={() => setShowCurrent(p => !p)} tabIndex={-1}>
                <EyeIcon show={showCurrent} />
              </button>
            </div>
          </div>

          <div className="field">
            <label>Nouveau mot de passe</label>
            <div className="input-password">
              <input
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                placeholder="6 caractères minimum"
                minLength={form.newPassword ? 6 : undefined}
              />
              <button type="button" className="eye-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                <EyeIcon show={showNew} />
              </button>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <div className="profile-actions">
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto' }}>
              {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
            <button
              type="button"
              className="logout-btn-profile"
              onClick={() => { logout(); navigate('/login') }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnexion
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
