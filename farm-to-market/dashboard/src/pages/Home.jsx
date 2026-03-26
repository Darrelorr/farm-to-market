import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import './Home.css'

export default function Home() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]         = useState('login')
  const [role, setRole]       = useState('farmer')
  const [loginError, setLoginError]     = useState('')
  const [regError, setRegError]         = useState('')
  const [regSuccess, setRegSuccess]     = useState('')

  // login fields
  const [loginEmail, setLoginEmail]     = useState('')
  const [loginPass, setLoginPass]       = useState('')

  // register fields
  const [fname, setFname]     = useState('')
  const [lname, setLname]     = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    setLoginError('')
    try {
      const res = await axios.post('/api/login', { email: loginEmail, password: loginPass })
      setUser(res.data.user)
      navigate('/dashboard')
    } catch {
      setLoginError('Invalid email or password.')
    }
  }

  const handleRegister = async () => {
    setRegError('')
    setRegSuccess('')
    if (!fname || !lname || !email || !password) { setRegError('Please fill in all required fields.'); return }
    try {
      await axios.post('/api/register', { fname, lname, email, password, role, phone, location })
      setRegSuccess('Account created! You can now sign in.')
      setTimeout(() => setTab('login'), 1500)
    } catch (err) {
      setRegError(err.response?.data?.error || 'Registration failed.')
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🌾</div>
          <h1>Kayapa FarmMarket</h1>
          <p>Connecting farmers directly to buyers</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>

        {/* LOGIN */}
        {tab === 'login' && (
          <div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {loginError && <div className="alert alert-error">❌ {loginError}</div>}
            <button className="btn btn-primary btn-full" onClick={handleLogin}>Sign In</button>
          </div>
        )}

        {/* REGISTER */}
        {tab === 'register' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>I am a:</label>
              <div className="role-selector">
                {[['farmer','👨‍🌾','Farmer'],['buyer','🛒','Buyer']].map(([r, icon, label]) => (
                  <div key={r} className={`role-option ${role === r ? 'selected' : ''}`} onClick={() => setRole(r)}>
                    <div className="role-icon">{icon}</div>
                    <div className="role-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>First Name</label><input type="text" placeholder="Juan" value={fname} onChange={e => setFname(e.target.value)} /></div>
              <div className="form-group"><label>Last Name</label><input type="text" placeholder="dela Cruz" value={lname} onChange={e => setLname(e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="form-group"><label>Contact Number</label><input type="text" placeholder="09xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            {role === 'farmer' && (
              <div className="form-group"><label>Farm Location / Barangay</label><input type="text" placeholder="Brgy. Kayapa" value={location} onChange={e => setLocation(e.target.value)} /></div>
            )}
            <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
            {regError   && <div className="alert alert-error">❌ {regError}</div>}
            {regSuccess && <div className="alert alert-success">✅ {regSuccess}</div>}
            <button className="btn btn-primary btn-full" onClick={handleRegister}>Create Account</button>
          </div>
        )}
      </div>
    </div>
  )
}
