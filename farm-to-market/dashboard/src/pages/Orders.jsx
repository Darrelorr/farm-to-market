import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../App.jsx'

const STATUS_BADGE = { pending: 'badge-amber', accepted: 'badge-blue', completed: 'badge-green', declined: 'badge-red' }

export default function MovieWatchList() {
  const { user } = useAuth()
  const location = useLocation()
  const isReports = location.pathname === '/reports'

  const [orders, setOrders]     = useState([])
  const [users, setUsers]       = useState([])
  const [products, setProducts] = useState([])
  const [reports, setReports]   = useState(null)
  const [toast, setToast]       = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [ou, uu, pu] = await Promise.all([
      axios.get('/api/orders'),
      axios.get('/api/users'),
      axios.get('/api/products'),
    ])
    setOrders(ou.data)
    setUsers(uu.data)
    setProducts(pu.data)
    if (isReports) {
      const r = await axios.get('/api/reports')
      setReports(r.data)
    }
  }

  const getUser    = (id) => users.find(u => u.id === id)
  const getProduct = (id) => products.find(p => p.id === id)

  const myOrders = user.role === 'farmer'
    ? orders.filter(o => o.farmerId === user.id)
    : user.role === 'buyer'
    ? orders.filter(o => o.buyerId === user.id)
    : orders

  const updateStatus = async (id, status) => {
    await axios.patch(`/api/orders/${id}/status`, { status })
    const msgs = { accepted: '✅ Order accepted!', declined: '❌ Order declined.', completed: '🎉 Marked as completed!' }
    showToast(msgs[status] || 'Updated.')
    fetchAll()
  }

  const pageTitle = isReports ? 'Reports & Analytics' : user.role === 'buyer' ? 'My Orders' : 'Incoming Orders'

  if (isReports && reports) {
    return (
      <div>
        <div className="topbar"><div className="topbar-title">Reports & Analytics</div></div>
        <div className="page-content">
          <div className="stats-grid">
            {[
              { icon: '👨‍🌾', color: 'green', value: reports.totalFarmers,    label: 'Registered Farmers' },
              { icon: '🛒',  color: 'amber', value: reports.totalBuyers,     label: 'Registered Buyers' },
              { icon: '✅',  color: 'earth', value: reports.completedOrders, label: 'Completed Orders' },
              { icon: '💰',  color: 'blue',  value: '₱' + reports.totalRevenue.toLocaleString(), label: 'Platform Revenue' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>
          <div className="grid-2 mt-24">
            <div className="card">
              <div className="card-header"><span className="card-title">Top Products</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {reports.topProducts.map((p, i) => (
                      <tr key={i}><td>{p.name}</td><td>{p.orders}</td><td>₱{p.revenue.toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Top Farmers</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Farmer</th><th>Products</th><th>Sales</th></tr></thead>
                  <tbody>
                    {reports.topFarmers.map((f, i) => (
                      <tr key={i}><td>{f.name}</td><td>{f.products}</td><td>₱{f.sales.toLocaleString()}</td></tr>
                    ))}
                    {reports.topFarmers.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '20px' }}>No sales data yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="topbar"><div className="topbar-title">{pageTitle}</div></div>
      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  {user.role !== 'buyer'  && <th>Buyer</th>}
                  {user.role !== 'farmer' && <th>Farmer</th>}
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  {user.role === 'farmer' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {myOrders.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div className="empty-state"><div className="empty-icon">📦</div><p>No orders yet.</p></div>
                  </td></tr>
                ) : myOrders.map(o => {
                  const buyer   = getUser(o.buyerId)
                  const farmer  = getUser(o.farmerId)
                  const product = getProduct(o.productId)
                  return (
                    <tr key={o.id}>
                      <td><code>{o.id}</code></td>
                      {user.role !== 'buyer'  && <td>{buyer?.fname} {buyer?.lname}</td>}
                      {user.role !== 'farmer' && <td>{farmer?.fname} {farmer?.lname}</td>}
                      <td>{product?.emoji} {product?.name}</td>
                      <td>{o.qty} kg</td>
                      <td>₱{o.total.toLocaleString()}</td>
                      <td>{o.date}</td>
                      <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                      {user.role === 'farmer' && (
                        <td>
                          {o.status === 'pending' && <>
                            <button className="btn btn-sm btn-amber" onClick={() => updateStatus(o.id, 'accepted')}>Accept</button>{' '}
                            <button className="btn btn-sm btn-danger" onClick={() => updateStatus(o.id, 'declined')}>Decline</button>
                          </>}
                          {o.status === 'accepted' && (
                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(o.id, 'completed')}>Complete</button>
                          )}
                          {['completed','declined'].includes(o.status) && '—'}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}
    </div>
  )
}
