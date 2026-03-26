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
  const [toast, setToast]   = useState('')

  // profile form
  const [fname, setFname]       = useState(user.fname)
  const [lname, setLname]       = useState(user.lname)
  const [email, setEmail]       = useState(user.email)
  const [phone, setPhone]       = useState(user.phone || '')
  const [loc,   setLoc]         = useState(user.location || '')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { if (!isProfile) fetchUsers() }, [isProfile])

  const fetchUsers = async () => {
    const res = await axios.get('/api/users')
    setUsers(res.data)
  }

  const toggleStatus = async (id) => {
    const res = await axios.patch(`/api/users/${id}/status`)
    showToast(`User ${res.data.status === 'active' ? 'activated' : 'deactivated'}.`)
    fetchUsers()
  }

  const saveProfile = async () => {
    const res = await axios.put(`/api/users/${user.id}`, { fname, lname, email, phone, location: loc })
    setUser({ ...user, ...res.data })
    showToast('✅ Profile updated!')
  }

  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

  // ── PROFILE VIEW ──
  if (isProfile) {
    return (
      <div>
        <div className="topbar"><div className="topbar-title">My Profile</div></div>
        <div className="page-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.role === 'farmer' ? '👨‍🌾' : user.role === 'buyer' ? '🛒' : '🛡️'}
            </div>
            <div>
              <div className="profile-name">{user.fname} {user.lname}</div>
              <div className="profile-role-label">{cap(user.role)} · {user.location || 'Kayapa, Nueva Vizcaya'}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Account Information</span></div>
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
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              {user.role !== 'admin' && (
                <div className="form-group">
                  <label>Location / Farm Address</label>
                  <input value={loc} onChange={e => setLoc(e.target.value)} />
                </div>
              )}
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 28px' }}
                onClick={saveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}
      </div>
    )
  }

  // ── ADMIN USERS VIEW ──
  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Manage Users</div>
        <div className="topbar-actions">
          <div className="users-summary">
            <span>👥 Total: <strong>{users.length}</strong></span>
            <span>👨‍🌾 Farmers: <strong>{users.filter(u => u.role === 'farmer').length}</strong></span>
            <span>🛒 Buyers: <strong>{users.filter(u => u.role === 'buyer').length}</strong></span>
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
                {users.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <p>No users found.</p>
                    </div>
                  </td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-row">
                        <div className="user-mini-avatar">
                          {u.fname?.[0]}{u.lname?.[0]}
                        </div>
                        <strong>{u.fname} {u.lname}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className="tag">{cap(u.role)}</span></td>
                    <td>{u.location || '—'}</td>
                    <td>{u.joined}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.id !== user.id ? (
                        <button
                          className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-amber'}`}
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-sm text-muted">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}
    </div>
  )
}
