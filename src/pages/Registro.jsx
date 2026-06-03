import { useState } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../lib/api'
import { CheckCircle, TrendingUp, Zap, BarChart2, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/logo.png'

const BENEFICIOS = [
  { icon: TrendingUp, texto: 'Tendencias culturales de TikTok analizadas cada semana' },
  { icon: BarChart2,  texto: 'Score de afinidad cultural para tu marca en segundos' },
  { icon: Zap,        texto: 'Briefs ejecutables listos para tu equipo de contenido' },
]

export default function Registro() {
  const [form, setForm] = useState({ empresa: '', email: '', password: '', confirmar: '' })
  const [mostrarPass, setMostrarPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [empresaEnviada, setEmpresaEnviada] = useState('')

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!form.empresa.trim()) {
      setError('Escribe el nombre de tu restaurante.')
      return
    }

    setLoading(true)
    try {
      await register(form.empresa.trim(), form.email, form.password)
      setEmpresaEnviada(form.empresa.trim())
      setExito(true)
    } catch (err) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('registrado')) {
        setError('Este email ya tiene una cuenta. Intenta iniciar sesión.')
      } else {
        setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Panel izquierdo (solo desktop) ── */}
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-br from-[#534AB7] to-[#3d3588] flex-col justify-between p-12 shrink-0">
        <div>
          <div className="mb-16">
            <img src={logo} alt="Red Freska" className="h-16 w-16 rounded-xl object-cover" />
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Inteligencia cultural para tu marca de food
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-12">
            Deja de adivinar qué tendencias le sirven a tu restaurante. Red Freska lo analiza automáticamente.
          </p>

          <div className="space-y-5">
            {BENEFICIOS.map(({ icon: Icon, texto }) => (
              <div key={texto} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-white" />
                </div>
                <p className="text-white/85 text-sm leading-relaxed pt-1.5">{texto}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">Red Freska © 2025 · UTEC Lima</p>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="mb-8 lg:hidden">
            <img src={logo} alt="Red Freska" className="h-12 w-12 rounded-xl object-cover" />
          </div>

          {exito ? (
            /* ── Estado: solicitud enviada ── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">
                Recibimos la solicitud de acceso para{' '}
                <span className="font-semibold text-gray-700">{empresaEnviada}</span>.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Nuestro equipo revisará tu cuenta y te dará acceso en las próximas <strong>24-48 horas hábiles</strong>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-2.5 bg-[#534AB7] text-white text-sm font-semibold rounded-xl hover:bg-[#453da0] transition"
              >
                Volver al inicio
              </Link>
            </div>

          ) : (
            /* ── Formulario de registro ── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Solicitar acceso</h1>
              <p className="text-sm text-gray-400 mb-7">
                Tu cuenta será revisada y activada en 24-48 horas.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nombre restaurante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del restaurante o cadena
                  </label>
                  <input
                    type="text"
                    value={form.empresa}
                    onChange={e => setField('empresa', e.target.value)}
                    placeholder="Ej: Bembos, La Lucha, Don Belisario"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email del equipo de marketing
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="marketing@turestaurante.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    value={form.confirmar}
                    onChange={e => setField('confirmar', e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#534AB7] hover:bg-[#453da0] text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 mt-2"
                >
                  {loading ? 'Enviando solicitud...' : 'Solicitar acceso'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                ¿Ya tienes acceso?{' '}
                <Link to="/login" className="text-[#534AB7] font-semibold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
