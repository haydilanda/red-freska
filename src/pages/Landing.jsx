import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import {
  TrendingUp, Zap, BarChart2, FileText, ArrowRight,
  CheckCircle, Brain, Database, Code2, Layers,
  ChevronRight, Mail, Building2, User, MessageSquare,
  Star, Search, Target,
} from 'lucide-react'

// ── Datos ──────────────────────────────────────────────────────────────────

const STATS = [
  { value: '17',   label: 'Tendencias detectadas', sub: 'en mercado limeño' },
  { value: '3',    label: 'Marcas piloto',          sub: 'food & beverage Lima' },
  { value: '80',   label: 'Videos analizados',      sub: 'por corrida de TikTok' },
  { value: '< 5m', label: 'Detección completa',     sub: 'TikTok → Score → Brief' },
]

const PASOS = [
  {
    num: '01',
    icon: Search,
    titulo: 'Detectamos',
    desc: 'Scrapeamos TikTok Perú en tiempo real. Claude analiza cientos de videos y extrae las tendencias culturales con mayor potencial viral.',
    color: '#534AB7',
    bg: '#534AB710',
  },
  {
    num: '02',
    icon: BarChart2,
    titulo: 'Evaluamos',
    desc: 'Calculamos un score cultural 0–100 por marca en 3 dimensiones: Público (40%), Territorio (35%) y Tono (25%). Completamente personalizado.',
    color: '#0ea5e9',
    bg: '#0ea5e910',
  },
  {
    num: '03',
    icon: FileText,
    titulo: 'Accionamos',
    desc: 'Generamos un brief ejecutable listo para tu equipo: ángulo narrativo, plataformas recomendadas y call to action en el tono de tu marca.',
    color: '#22c55e',
    bg: '#22c55e10',
  },
]

const FEATURES = [
  { icon: Brain,     titulo: 'Score cultural con IA',        desc: 'Evaluamos cada tendencia contra el ADN de tu marca. No intuición — datos.' },
  { icon: Target,    titulo: 'Personalizado por marca',      desc: 'El mismo fenómeno viral puede ser oro para una marca y ruido para otra. Lo distinguimos.' },
  { icon: Zap,       titulo: 'Brief ejecutable al instante', desc: 'De tendencia detectada a brief listo en minutos. Tu equipo lo recibe y ejecuta.' },
  { icon: TrendingUp,titulo: 'Momentum de tendencia',        desc: 'Sabemos si está emergiendo, en su pico o decayendo. El timing lo es todo en marketing.' },
  { icon: Star,      titulo: 'Relevancia food 1–5',          desc: 'Filtramos el ruido. Solo llegan las tendencias que pueden conectar con tu producto.' },
  { icon: Layers,    titulo: 'Panel admin completo',         desc: 'Gestiona marcas, aprueba tendencias y controla qué ve cada cliente.' },
]

const STACK = [
  { nombre: 'React + Tailwind', rol: 'Frontend',         color: '#0ea5e9' },
  { nombre: 'FastAPI + Python', rol: 'Backend',          color: '#f59e0b' },
  { nombre: 'Supabase',         rol: 'Base de datos',    color: '#22c55e' },
  { nombre: 'Claude AI',        rol: 'Inteligencia',     color: '#534AB7' },
  { nombre: 'Apify',            rol: 'Scraping TikTok',  color: '#ef4444' },
]

const EQUIPO = [
  {
    nombre: 'Haydi Landa Vilchez',
    rol: 'UX & Research',
    desc: 'Diseño de experiencia, comprensión del usuario y recopilación de insights de cliente. Traduce la voz del mercado en decisiones de producto.',
    inicial: 'H',
    color: '#534AB7',
  },
  {
    nombre: 'Harold Inca Tenorio',
    rol: 'Backend & Arquitectura',
    desc: 'Diseño de base de datos, conexión backend–frontend e integración de APIs. Construye la infraestructura que sostiene toda la plataforma.',
    inicial: 'H',
    color: '#0ea5e9',
  },
]

// ── Componente principal ───────────────────────────────────────────────────

export default function Landing() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setErrorForm('')
    try {
      const res = await fetch('https://formspree.io/f/xzzblqbd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEnviado(true)
      } else {
        setErrorForm('No se pudo enviar. Escríbenos directamente a redfreska@gmail.com')
      }
    } catch {
      setErrorForm('Error de red. Escríbenos a redfreska@gmail.com')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Red Freska" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-bold text-gray-900 text-lg">Red Freska</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#como-funciona" className="hover:text-gray-900 transition">Cómo funciona</a>
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <a href="#equipo" className="hover:text-gray-900 transition">Equipo</a>
            <a href="#contacto" className="hover:text-gray-900 transition">Contacto</a>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-1.5 bg-[#534AB7] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#453da0] transition"
          >
            Acceder <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-[#534AB7] via-[#3d3588] to-[#1e1a4e] relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-white/5" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Avalado por UTEC Lima
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Convierte tendencias de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#60a5fa]">
              TikTok
            </span>{' '}
            en campañas reales
          </h1>

          <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            Red Freska analiza el contenido viral del mercado limeño y calcula qué tan relevante es cada tendencia para tu marca de food — en minutos, con IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contacto"
              className="flex items-center justify-center gap-2 bg-white text-[#534AB7] font-bold px-8 py-3.5 rounded-2xl hover:bg-gray-100 transition text-base"
            >
              Quiero una demo <ArrowRight size={18} />
            </a>
            <a
              href="#como-funciona"
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/20 transition text-base border border-white/20"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-[#534AB7] mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-gray-800">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── El problema ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-4">El problema</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">
            El marketing de food en Lima<br />
            <span className="text-gray-400">sigue adivinando tendencias</span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12">
            Los equipos de marketing pasan horas en TikTok tratando de entender qué es viral — sin saber si realmente conecta con su audiencia. Red Freska lo analiza automáticamente y te dice exactamente qué activar y cómo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { titulo: 'Sin Red Freska', puntos: ['Análisis manual de TikTok', 'Decisiones por intuición', 'Briefs que tardan días', 'Tendencias que ya pasaron'], malo: true },
              { titulo: 'Con Red Freska', puntos: ['Detección automática semanal', 'Score cultural 0-100 por marca', 'Brief listo en minutos', 'Momentum: emergente, pico o declinando'], malo: false },
            ].map((col) => (
              <div
                key={col.titulo}
                className={`rounded-2xl p-6 text-left ${col.malo ? 'bg-red-50 border border-red-100' : 'bg-[#534AB7] text-white'}`}
              >
                <p className={`text-sm font-bold mb-4 ${col.malo ? 'text-red-600' : 'text-white/80'}`}>{col.titulo}</p>
                <ul className="space-y-3">
                  {col.puntos.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 shrink-0 ${col.malo ? 'text-red-400' : 'text-white/60'}`}>
                        {col.malo ? '✗' : '✓'}
                      </span>
                      <span className={col.malo ? 'text-red-700' : 'text-white/90'}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">El proceso</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Cómo funciona Red Freska</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PASOS.map((paso) => {
              const Icon = paso.icon
              return (
                <div key={paso.num} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                  <span className="absolute top-5 right-5 text-5xl font-black text-gray-100 leading-none select-none">
                    {paso.num}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: paso.bg }}
                  >
                    <Icon size={22} style={{ color: paso.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{paso.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{paso.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">Capacidades</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Todo lo que incluye la plataforma</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-[#534AB7]/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#534AB7]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tecnología ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">Tecnología</p>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Construido con lo mejor de cada mundo</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Stack moderno y escalable. Cada herramienta fue elegida para maximizar velocidad de análisis y precisión del scoring.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {STACK.map(({ nombre, rol, color }) => (
              <div
                key={nombre}
                className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3.5"
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">{nombre}</p>
                  <p className="text-xs text-gray-400">{rol}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo ── */}
      <section id="equipo" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">Equipo</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Las personas detrás de Red Freska</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EQUIPO.map((p) => (
              <div key={p.nombre} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.inicial}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{p.nombre}</p>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block mt-1 mb-3"
                    style={{ backgroundColor: p.color + '15', color: p.color }}
                  >
                    {p.rol}
                  </span>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
            <img src={logo} alt="UTEC" className="h-12 w-12 rounded-xl object-cover shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-800">Avalado por UTEC Lima</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Red Freska es un proyecto desarrollado bajo el respaldo académico de la Universidad de Ingeniería y Tecnología — UTEC Lima.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA + Formulario ── */}
      <section id="contacto" className="py-20 px-6 bg-gradient-to-br from-[#534AB7] to-[#3d3588]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Contacto</p>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-5">
              ¿Tu marca quiere activar las tendencias correctas?
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Agenda una demo y te mostramos en vivo cómo Red Freska analiza TikTok y genera briefs listos para tu equipo de marketing.
            </p>
            <ul className="space-y-3">
              {['Sin compromiso', 'Demo personalizada con tu marca', 'Resultados en tiempo real'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-white/50">
              O escríbenos directo:{' '}
              <a href="mailto:redfreska@gmail.com" className="text-white font-semibold hover:underline">
                redfreska@gmail.com
              </a>
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl p-7 shadow-2xl">
            {enviado ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">¡Mensaje recibido!</h3>
                <p className="text-sm text-gray-500">
                  Nos ponemos en contacto contigo en las próximas 24 horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg mb-5">Solicitar demo</h3>
                {[
                  { key: 'nombre',   label: 'Tu nombre',             icon: User,          placeholder: 'María García', type: 'text' },
                  { key: 'empresa',  label: 'Restaurante / empresa',  icon: Building2,     placeholder: 'Bembos, La Lucha...', type: 'text' },
                  { key: 'email',    label: 'Email de contacto',      icon: Mail,          placeholder: 'maria@turestaurante.com', type: 'email' },
                ].map(({ key, label, icon: Icon, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type={type}
                        required
                        value={form[key]}
                        onChange={e => setField(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">¿Qué te interesa explorar?</label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-gray-300" />
                    <textarea
                      value={form.mensaje}
                      onChange={e => setField('mensaje', e.target.value)}
                      rows={3}
                      placeholder="Cuéntanos sobre tu marca y qué esperas de Red Freska..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300 resize-none"
                    />
                  </div>
                </div>
                {errorForm && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{errorForm}</p>
                )}
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-[#534AB7] hover:bg-[#453da0] text-white font-bold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {enviando ? 'Enviando...' : <>Solicitar demo <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Red Freska" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-bold text-gray-700">Red Freska</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Inteligencia cultural para marcas de food · Avalado por UTEC Lima · 2025
          </p>
          <a href="mailto:redfreska@gmail.com" className="text-xs text-[#534AB7] font-semibold hover:underline">
            redfreska@gmail.com
          </a>
        </div>
      </footer>

    </div>
  )
}
