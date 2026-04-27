import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import './Users.css'

export default function Users() {
  const { user, setUser } = useAuth()
  const location = useLocation()
  const isProfile = location.pathname === '/profile'

  const [users, setUsers]   = useState([])
  const [stats, setStats]   = useState({ total: 0, farmers: 0, buyers: 0 })
  const [toast, setToast]   = useState('')

  const [fname, setFname]   = useState(user.fname)
  const [lname, setLname]   = useState(user.lname)
  const [email, setEmail]   = useState(user.email)
  const [phone, setPhone]   = useState(user.phone || '')
  const [loc,   setLoc]     = useState(user.location || '')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    if (isProfile && user.role === 'admin') {
      fetchUsers(true)
    } else if (!isProfile) {
      fetchUsers(false)
    }
  }, [isProfile])

  const fetchUsers = async (statsOnly = false) => {
    const res = await axios.get('/api/users')
    const all = res.data

    setStats({
      total:   all.length,
      farmers: all.filter(u => u.role === 'farmer').length,
      buyers:  all.filter(u => u.role === 'buyer').length,
    })

    if (!statsOnly) setUsers(all)
  }

  const toggleStatus = async (id) => {
    const res = await axios.patch(`/api/users/${id}/status`)
    showToast(`User ${res.data.status === 'active' ? 'activated' : 'deactivated'}.`)
    fetchUsers(false)
  }

  const saveProfile = async () => {
    const res = await axios.put(`/api/users/${user.id}`, {
      fname, lname, email, phone, location: loc
    })
    setUser({ ...user, ...res.data })
    showToast('✅ Profile updated!')
  }

  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

  // ── PROFILE VIEW ──
  if (isProfile) {
    return (
      <div>
        <div className="topbar">
          <div className="topbar-title">My Profile</div>
        </div>

        <div className="page-content">

          <div className="profile-header">
            <div className="profile-avatar">
              {user.role === 'farmer' ? '👨‍🌾' : user.role === 'buyer' ? '🛒' : '🛡️'}
            </div>
            <div className="profile-header-info">
              <div className="profile-name">{user.fname} {user.lname}</div>
              <div className="profile-role-label">
                {cap(user.role)} · {user.location || 'Kayapa, Nueva Vizcaya'}
              </div>
            </div>
          </div>

          {/* ADMIN STATS */}
          {user.role === 'admin' && (
            <div className="profile-stats-row">
              <div className="profile-stat">
                <div className="profile-stat-value">{stats.total}</div>
                <div className="profile-stat-label">Total Users</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">{stats.farmers}</div>
                <div className="profile-stat-label">Farmers</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">{stats.buyers}</div>
                <div className="profile-stat-label">Buyers</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <span className="card-title">Account Information</span>
            </div>

            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={fname} onChange={e => setFname(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={lname} onChange={e => setLname(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              {user.role !== 'admin' && (
                <div className="form-group">
                  <label>Location</label>
                  <input value={loc} onChange={e => setLoc(e.target.value)} />
                </div>
              )}

              <button className="btn btn-primary" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>

        </div>

        {toast && <div className="toast">{toast}</div>}
      </div>
    )
  }

  // ── ADMIN USERS VIEW ──
  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Manage Users</div>

        {/* 🔥 FIXED BIG STATS */}
        <div className="topbar-actions">
          <div className="users-summary">

            <div className="summary-item green">
              <span className="icon">👥</span>
              <span className="label">Total</span>
              <span className="value">{stats.total}</span>
            </div>

            <div className="summary-item earth">
              <span className="icon">👨‍🌾</span>
              <span className="label">Farmers</span>
              <span className="value">{stats.farmers}</span>
            </div>

            <div className="summary-item amber">
              <span className="icon">🛒</span>
              <span className="label">Buyers</span>
              <span className="value">{stats.buyers}</span>
            </div>

          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.fname} {u.lname}</td>
                    <td>{u.email}</td>
                    <td>{cap(u.role)}</td>
                    <td>{u.location || '-'}</td>
                    <td>{u.joined}</td>
                    <td>{u.status}</td>
                    <td>
                      {u.id !== user.id && (
                        <button
                          className={`btn-status ${u.status === 'active' ? 'deactivate' : 'activate'}`}
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}