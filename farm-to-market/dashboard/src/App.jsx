import React, { createContext, useContext, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Users from './pages/Users.jsx'
import Orders from './pages/Orders.jsx'
import Transactions from './pages/Transactions.jsx'
import Sidebar from './pages/Sidebar.jsx'
import './App.css'

// ── Auth Context ──────────────────────────────────────
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}

export default function App() {
  const [user, setUser] = useState(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <AppLayout><Products /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute>
              <AppLayout><Orders /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/transactions" element={
            <PrivateRoute>
              <AppLayout><Transactions /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute>
              <AppLayout><Users /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <AppLayout><Orders /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <AppLayout><Users /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
