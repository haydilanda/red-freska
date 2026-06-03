import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'
import { login } from '../lib/api'
import logo from '../assets/logo.png'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      setUser({
        email: data.email,
        rol: data.rol,
        marca_id: data.marca_id,
        marca_activa: data.marca_activa,
      })
      if (data.marca_activa === false) {
        navigate('/pendiente')
      } else {
        navigate(data.rol === 'admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#534AB7] to-[#3d3588] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Red Freska" className="h-36 w-36 rounded-2xl object-cover shadow-lg" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Inicia sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@marca.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/40 focus:border-[#534AB7] text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/40 focus:border-[#534AB7] text-sm transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#534AB7] hover:bg-[#453da0] text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 text-sm mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

        </div>

        <p className="text-center text-white/60 text-sm mt-5">
          ¿Tu restaurante aún no tiene acceso?{' '}
          <Link to="/registro" className="text-white font-semibold underline underline-offset-2 hover:text-white/80 transition">
            Solicitar acceso
          </Link>
        </p>

        <p className="text-center text-white/30 text-xs mt-3">
          Red Freska © 2025 · UTEC Lima
        </p>
      </div>
    </div>
  )
}
