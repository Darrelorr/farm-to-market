import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import './Products.css'

const THUMB_BG = { Vegetables: 'green-bg', Fruits: 'amber-bg', Grains: 'amber-bg', 'Root Crops': 'earth-bg' }

export default function Products() {
  const { user } = useAuth()
  const location = useLocation()

  const [products, setProducts]   = useState([])
  const [users, setUsers]         = useState([])
  const [category, setCategory]   = useState('')
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [orderModal, setOrderModal] = useState(null)
  const [orderQty, setOrderQty]   = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [toast, setToast]         = useState('')

  // add-product form
  const [form, setForm] = useState({ name: '', category: 'Vegetables', emoji: '', price: '', stock: '', desc: '' })

  const isDashboard = location.pathname === '/dashboard'
  const pageTitle   = user.role === 'buyer'
    ? (isDashboard ? 'Dashboard' : 'Browse Products')
    : (isDashboard ? 'Dashboard' : 'My Products')

  useEffect(() => { fetchProducts(); fetchUsers() }, [])

  const fetchProducts = async () => {
    const params = user.role === 'farmer' ? { farmerId: user.id } : { status: 'active' }
    const res = await axios.get('/api/products', { params })
    setProducts(res.data)
  }

  const fetchUsers = async () => {
    const res = await axios.get('/api/users')
    setUsers(res.data)
  }

  const farmerOf = (id) => users.find(u => u.id === id)

  const filteredProducts = products.filter(p => {
    if (category && p.category !== category) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (user.role === 'farmer') return true
    return p.status === 'active' && p.stock > 0
  })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAddProduct = async () => {
    if (!form.name || !form.price || !form.stock) { showToast('❌ Fill in required fields.'); return }
    await axios.post('/api/products', { ...form, farmerId: user.id, price: +form.price, stock: +form.stock })
    setShowModal(false)
    setForm({ name: '', category: 'Vegetables', emoji: '', price: '', stock: '', desc: '' })
    showToast('✅ Product listed!')
    fetchProducts()
  }

  const handleEditProduct = async () => {
    if (!editModal.name || !editModal.price || !editModal.stock) { showToast('❌ Fill in required fields.'); return }
    await axios.put(`/api/products/${editModal.id}`, {
      name: editModal.name,
      category: editModal.category,
      emoji: editModal.emoji,
      price: +editModal.price,
      stock: +editModal.stock,
      desc: editModal.desc,
    })
    setEditModal(null)
    showToast('✅ Product updated!')
    fetchProducts()
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this product?')) return
    await axios.delete(`/api/products/${id}`)
    showToast('🗑️ Product removed.')
    fetchProducts()
  }

  const handlePlaceOrder = async () => {
    const qty = parseInt(orderQty)
    if (!qty || qty < 1) { showToast('❌ Enter a valid quantity.'); return }
    if (qty > orderModal.stock) { showToast('❌ Not enough stock.'); return }
    await axios.post('/api/orders', {
      buyerId: user.id,
      farmerId: orderModal.farmerId,
      productId: orderModal.id,
      qty,
      total: qty * orderModal.price,
      notes: orderNotes
    })
    setOrderModal(null)
    showToast('✅ Order placed!')
  }

  // ── Stats for dashboard ──
  const stats = user.role === 'farmer'
    ? [
        { icon: '🌱', color: 'green', value: products.length,  label: 'Active Listings' },
        { icon: '📦', color: 'amber', value: '—',              label: 'Total Orders' },
        { icon: '💰', color: 'blue',  value: '₱—',             label: 'Total Revenue' },
      ]
    : [
        { icon: '🛒', color: 'green', value: products.length,  label: 'Available Products' },
        { icon: '📦', color: 'amber', value: '—',              label: 'My Orders' },
        { icon: '💰', color: 'blue',  value: '₱—',             label: 'Total Spent' },
      ]

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">{pageTitle}</div>
        <div className="topbar-actions">
          {user.role === 'buyer' && (
            <div className="search-box">
              <span>🔍</span>
              <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
          {user.role === 'buyer' && !isDashboard && (
            <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
              <option value="">All Categories</option>
              <option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Root Crops</option>
            </select>
          )}
          {user.role === 'farmer' && !isDashboard && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Product</button>
          )}
        </div>
      </div>

      <div className="page-content">

        {/* Dashboard stats */}
        {isDashboard && (
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Farmer table view */}
        {user.role === 'farmer' && (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Crop</th><th>Price/kg</th><th>Stock (kg)</th><th>Category</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6}>
                      <div className="empty-state"><div className="empty-icon">🌱</div><p>No products listed yet.</p></div>
                    </td></tr>
                  ) : filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td data-label="Crop"><strong>{p.emoji} {p.name}</strong></td>
                      <td data-label="Price/kg">₱{p.price}/kg</td>
                      <td data-label="Stock">{p.stock} kg</td>
                      <td data-label="Category"><span className="tag">{p.category}</span></td>
                      <td data-label="Status"><span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span></td>
                      <td data-label="Actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditModal({...p})}>Edit Product</button>
                        {' '}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buyer grid view */}
        {user.role === 'buyer' && (
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-icon">🔍</div><p>No products found.</p>
              </div>
            ) : filteredProducts.map(p => {
              const farmer = farmerOf(p.farmerId)
              return (
                <div className="product-card" key={p.id} onClick={() => { setOrderModal(p); setOrderQty(''); setOrderNotes('') }}>
                  <div className={`product-thumb ${THUMB_BG[p.category] || 'green-bg'}`}>{p.emoji}</div>
                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-farmer">👨‍🌾 {farmer?.fname} {farmer?.lname} · {farmer?.location}</div>
                    <span className="tag">{p.category}</span>
                    <div className="product-meta">
                      <span className="product-price">₱{p.price}/kg</span>
                      <span className="product-qty">{p.stock} kg left</span>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '10px' }}>Order Now</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Product Listing</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Crop Name *</label><input placeholder="e.g. Sayote, Kamote" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Root Crops</option>
                  </select>
                </div>
                <div className="form-group"><label>Emoji Icon</label><input placeholder="🥬" maxLength={2} value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Price per kg (₱) *</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                <div className="form-group"><label>Stock (kg) *</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddProduct}>Add Listing</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Edit Product</span>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Crop Name *</label><input value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Category</label>
                  <select value={editModal.category} onChange={e => setEditModal({...editModal, category: e.target.value})}>
                    <option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Root Crops</option>
                  </select>
                </div>
                <div className="form-group"><label>Emoji Icon</label><input maxLength={2} value={editModal.emoji} onChange={e => setEditModal({...editModal, emoji: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Price per kg (₱) *</label><input type="number" value={editModal.price} onChange={e => setEditModal({...editModal, price: e.target.value})} /></div>
                <div className="form-group"><label>Stock (kg) *</label><input type="number" value={editModal.stock} onChange={e => setEditModal({...editModal, stock: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={editModal.desc || ''} onChange={e => setEditModal({...editModal, desc: e.target.value})} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditProduct}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOrderModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Place Order</span>
              <button className="modal-close" onClick={() => setOrderModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="order-product-info">
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{orderModal.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--green-dark)' }}>{orderModal.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
                  by {farmerOf(orderModal.farmerId)?.fname} {farmerOf(orderModal.farmerId)?.lname}
                </div>
                <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 700, color: 'var(--green-mid)' }}>
                  ₱{orderModal.price}/kg <span style={{ fontWeight: 400, fontSize: '12px', color: 'var(--gray-500)' }}>({orderModal.stock} kg available)</span>
                </div>
              </div>
              <div className="form-group"><label>Quantity (kg)</label><input type="number" min={1} value={orderQty} onChange={e => setOrderQty(e.target.value)} /></div>
              <div className="form-group"><label>Notes (optional)</label><textarea rows={2} value={orderNotes} onChange={e => setOrderNotes(e.target.value)} /></div>
              <div className="order-total-box">
                <span className="text-sm text-muted">Estimated Total</span>
                <span className="order-total-value">₱{((+orderQty || 0) * orderModal.price).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted" style={{ marginTop: '8px' }}>⚠️ Payment is handled offline between parties.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setOrderModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePlaceOrder}>Confirm Order</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}
    </div>
  )
}