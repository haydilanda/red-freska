import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DetalleTendencia from './pages/DetalleTendencia'
import Tendencias from './pages/Tendencias'
import Ajustes from './pages/Ajustes'
import Admin from './pages/Admin'
import Clientes from './pages/Clientes'
import Registro from './pages/Registro'
import CuentaPendiente from './pages/CuentaPendiente'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.rol !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión desde localStorage al recargar
  useEffect(() => {
    const saved = localStorage.getItem('rf_user')
    const token = localStorage.getItem('rf_token')
    if (saved && token) {
      setUser(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  function handleSetUser(userData) {
    if (userData) {
      localStorage.setItem('rf_user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('rf_user')
      localStorage.removeItem('rf_token')
    }
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/pendiente"
            element={
              <ProtectedRoute>
                <CuentaPendiente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tendencia/:id"
            element={
              <ProtectedRoute>
                <DetalleTendencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute requireAdmin>
                <Clientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tendencias"
            element={
              <ProtectedRoute>
                <Tendencias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ajustes"
            element={
              <ProtectedRoute>
                <Ajustes />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
