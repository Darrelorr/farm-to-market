import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'

const STATUS_BADGE = { pending: 'badge-amber', accepted: 'badge-blue', completed: 'badge-green', declined: 'badge-red' }

export default function Car() {
  const { user } = useAuth()
  const [orders, setOrders]     = useState([])
  const [users, setUsers]       = useState([])
  const [products, setProducts] = useState([])

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
  }

  const getUser    = (id) => users.find(u => u.id === id)
  const getProduct = (id) => products.find(p => p.id === id)

  const txns = orders.filter(o => {
    const isMine = user.role === 'farmer'
      ? o.farmerId === user.id
      : user.role === 'buyer'
      ? o.buyerId === user.id
      : true
    return isMine && (o.status === 'completed' || o.status === 'accepted')
  })

  const totalValue = txns
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + o.total, 0)

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Transaction History</div>
        <div className="topbar-actions">
          <div style={{
            background: 'var(--green-pale)',
            border: '1px solid #b2dfb2',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 16px',
            fontSize: '13px',
            color: 'var(--green-mid)',
            fontWeight: 500
          }}>
            Total: ₱{totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Txn ID</th>
                  {user.role !== 'buyer'  && <th>Buyer</th>}
                  {user.role !== 'farmer' && <th>Farmer</th>}
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {txns.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <p>No transactions yet.</p>
                    </div>
                  </td></tr>
                ) : txns.map(o => {
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
                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
