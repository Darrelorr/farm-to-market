import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import './Sidebar.css'

const menus = {
  farmer: [
    { icon: '📊', label: 'Dashboard',    path: '/dashboard' },
    { icon: '🌱', label: 'Products',     path: '/products' },
    { icon: '📦', label: 'Orders',       path: '/orders' },
    { icon: '💳', label: 'Transactions', path: '/transactions' },
    { icon: '👤', label: 'Profile',      path: '/profile' },
  ],
  buyer: [
    { icon: '📊', label: 'Dashboard',  path: '/dashboard' },
    { icon: '🛒', label: 'Browse',     path: '/products' },
    { icon: '📦', label: 'Orders',     path: '/orders' },
    { icon: '💳', label: 'History',    path: '/transactions' },
    { icon: '👤', label: 'Profile',    path: '/profile' },
  ],
  admin: [
    { icon: '📊', label: 'Dashboard',  path: '/dashboard' },
    { icon: '👥', label: 'Users',      path: '/users' },
    { icon: '💳', label: 'Txns',       path: '/transactions' },
    { icon: '📈', label: 'Reports',    path: '/reports' },
    { icon: '👤', label: 'Profile',    path: '/profile' },
  ],
}

export default function Sidebar() {
  const { user, setUser } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  if (!user) return null

  const items = menus[user.role] || menus.buyer

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/Kayapa_Nueva_Vizcaya.png" alt="Kayapa Logo" className="logo-mark-img" />
            <div className="logo-text-wrapper">
              <div className="logo-text">Kayapa Farm to Market</div>
            </div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user.fname?.[0]}{user.lname?.[0]}
          </div>
          <div className="user-info">
            <div className="user-name">{user.fname} {user.lname}</div>
            <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {items.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <img src="/Kayapa_Nueva_Vizcaya.png" alt="Kayapa Logo" className="mobile-logo-img" />
          <span className="mobile-logo-text">Kayapa Farm to Market</span>
        </div>
        <div className="mobile-user-info">
          <span className="mobile-user-name">{user.fname} {user.lname}</span>
          <button className="mobile-logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        {items.map(item => (
          <div
            key={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </>
  )
}
