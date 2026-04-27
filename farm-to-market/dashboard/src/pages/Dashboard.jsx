import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers]       = useState([])

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [ou, pu] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/products'),
      ])
      setOrders(ou.data)
      setProducts(pu.data)

      if (user.role === 'admin') {
        const uu = await axios.get('/api/users')
        setUsers(uu.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const stats = getStats(user, orders, products, users)

  // 👉 summary stats (ADMIN only)
  const totalUsers = users.length
  const farmers = users.filter(u => u.role === 'farmer').length
  const buyers  = users.filter(u => u.role === 'buyer').length

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Dashboard</div>
      </div>

      <div className="page-content">

        {/* MAIN STATS */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 NEW BIG SUMMARY SECTION */}
        {user.role === 'admin' && (
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon green">👥</div>
              <div>
                <div className="summary-value">{totalUsers}</div>
                <div className="summary-label">Total Users</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon earth">👨‍🌾</div>
              <div>
                <div className="summary-value">{farmers}</div>
                <div className="summary-label">Farmers</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon amber">🛒</div>
              <div>
                <div className="summary-value">{buyers}</div>
                <div className="summary-label">Buyers</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function getStats(user, orders, products, users) {
  if (user.role === 'farmer') {
    const myProducts   = products.filter(p => p.farmerId === user.id)
    const myOrders     = orders.filter(o => o.farmerId === user.id)
    const pending      = myOrders.filter(o => o.status === 'pending').length
    const revenue      = myOrders
      .filter(o => o.status === 'completed')
      .reduce((s, o) => s + o.total, 0)

    return [
      { icon: '🌱', color: 'green', value: myProducts.filter(p => p.status === 'active').length, label: 'Active Listings' },
      { icon: '📦', color: 'amber', value: myOrders.length,  label: 'Total Orders' },
      { icon: '⏳', color: 'earth', value: pending,           label: 'Pending Orders' },
      { icon: '💰', color: 'blue',  value: '₱' + revenue.toLocaleString(), label: 'Total Revenue' },
    ]
  }

  if (user.role === 'buyer') {
    const myOrders  = orders.filter(o => o.buyerId === user.id)
    const completed = myOrders.filter(o => o.status === 'completed').length
    const spent     = myOrders
      .filter(o => o.status === 'completed')
      .reduce((s, o) => s + o.total, 0)

    return [
      { icon: '🛒', color: 'green', value: products.length,   label: 'Available Products' },
      { icon: '📦', color: 'amber', value: myOrders.length,   label: 'My Orders' },
      { icon: '✅', color: 'earth', value: completed,          label: 'Completed Orders' },
      { icon: '💳', color: 'blue',  value: '₱' + spent.toLocaleString(), label: 'Total Spent' },
    ]
  }

  if (user.role === 'admin') {
    const farmers   = users.filter(u => u.role === 'farmer').length
    const buyers    = users.filter(u => u.role === 'buyer').length
    const completed = orders.filter(o => o.status === 'completed').length
    const revenue   = orders
      .filter(o => o.status === 'completed')
      .reduce((s, o) => s + o.total, 0)

    return [
      { icon: '👨‍🌾', color: 'green', value: farmers,  label: 'Registered Farmers' },
      { icon: '🛒',  color: 'amber', value: buyers,   label: 'Registered Buyers' },
      { icon: '✅',  color: 'earth', value: completed, label: 'Completed Orders' },
      { icon: '💰',  color: 'blue',  value: '₱' + revenue.toLocaleString(), label: 'Platform Revenue' },
    ]
  }

  return []
}