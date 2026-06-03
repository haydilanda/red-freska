import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import { Clock, Mail, LogOut } from 'lucide-react'
import logo from '../assets/logo.png'

const PASOS = [
  { num: '1', label: 'Solicitud enviada', done: true },
  { num: '2', label: 'Revisión del equipo Red Freska', done: false, active: true },
  { num: '3', label: 'Cuenta activada → acceso al dashboard', done: false },
]

export default function CuentaPendiente() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#534AB7] to-[#3d3588] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Red Freska" className="h-20 w-20 rounded-2xl object-cover shadow-lg" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Ícono animado */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center">
              <Clock size={36} className="text-amber-500 animate-pulse" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
            Cuenta en revisión
          </h1>
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
            Tu solicitud de acceso para{' '}
            <span className="font-semibold text-gray-700">
              {user?.marca_nombre ?? 'tu restaurante'}
            </span>{' '}
            está siendo procesada por nuestro equipo.
          </p>

          {/* Timeline de pasos */}
          <div className="space-y-3 mb-8">
            {PASOS.map((paso, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* Indicador */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  paso.done
                    ? 'bg-green-500 text-white'
                    : paso.active
                      ? 'bg-amber-400 text-white ring-4 ring-amber-100'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {paso.done ? '✓' : paso.num}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    paso.done ? 'text-green-700' :
                    paso.active ? 'text-amber-700' :
                    'text-gray-400'
                  }`}>
                    {paso.label}
                  </p>
                  {paso.active && (
                    <p className="text-xs text-amber-500 mt-0.5">En proceso · 24-48 horas hábiles</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info email */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 mb-6">
            <Mail size={15} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Te notificaremos a{' '}
              <span className="font-semibold text-gray-700">{user?.email}</span>{' '}
              cuando tu cuenta esté lista. Si tienes alguna consulta escríbenos a{' '}
              <a href="mailto:hola@redfreska.com" className="text-[#534AB7] font-medium">hola@redfreska.com</a>.
            </p>
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Red Freska © 2025 · UTEC Lima</p>
      </div>
    </div>
  )
}
