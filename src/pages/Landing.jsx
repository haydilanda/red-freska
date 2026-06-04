import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

// ── Imágenes — tus fotos reales ─────────────────────────────────────────────
import _f1  from '../assets/foto1.jpg'
import _f2  from '../assets/foto2.jpg'
import _f3  from '../assets/foto3.jpg'
import _f4  from '../assets/foto4.jpg'
import _f5  from '../assets/foto5.jpg'
import _f6  from '../assets/foto6.jpg'
import _f7  from '../assets/foto7.jpg'
import _f8  from '../assets/foto8.jpg'
import _f9  from '../assets/foto9.jpg'
import _f10 from '../assets/foto10.jpg'
import _f11 from '../assets/foto11.jpg'
import _f12 from '../assets/foto12.jpg'
import _f13 from '../assets/foto13.jpg'
import _f14 from '../assets/foto14.jpg'
import _f15 from '../assets/foto15.jpg'
import _f16 from '../assets/foto16.jpg'

const IMGS = {
  foto1: _f1,   // hero mosaico
  foto2: _f2,   // hero mosaico
  foto3: _f3,   // hero mosaico
  foto4: _f4,   // el problema
  foto5: _f5,   // cómo funciona — detectamos
  foto6: _f6,   // cómo funciona — evaluamos
  foto7: _f7,   // cómo funciona — accionamos
  foto8: _f8,   // galería cultura
  foto9: _f9,   // galería cultura
  foto10: _f10, // galería cultura
  foto11: _f11, // galería cultura
  foto12: _f12, // galería cultura
  foto13: _f13, // galería cultura
  foto14: _f14, // contacto fondo
  foto15: _f15, // extra
  foto16: _f16, // extra
}

// Tendencias reales detectadas — el ticker las muestra en loop
const TENDENCIAS = [
  'Gastronomía peruana como identidad', 'Cumbia revival digital', 'Humor sobre el acento',
  'Vida en el campo peruano', 'Danzas folklóricas van viral', 'Turismo interno: descubre Perú',
  'Tráfico como símbolo cultural', 'Orgullo peruano ante desastres', 'Temblores y reacciones cómicas',
  'Simulacro de sismo meme nacional', 'Lima: el Dubai latinoamericano', 'Perú en memes vs realidad',
]

// ── Subcomponentes ───────────────────────────────────────────────────────────

function Img({ src, alt = '', className = '', fallback = '#1a1a2e' }) {
  const [err, setErr] = useState(false)
  if (err) return <div className={className} style={{ backgroundColor: fallback }} />
  return (
    <img
      src={src} alt={alt}
      className={className}
      onError={() => setErr(true)}
    />
  )
}

function Ticker() {
  return (
    <div className="bg-[#1a1a2e] py-4 overflow-hidden border-y border-white/5">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...TENDENCIAS, ...TENDENCIAS].map((t, i) => (
          <span key={i} className="mx-8 text-sm font-medium text-white/40 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#534AB7] inline-block shrink-0" />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Landing ──────────────────────────────────────────────────────────────────

export default function Landing() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setErrorForm('')
    try {
      const body = new URLSearchParams({
        'form-name': 'contacto',
        ...form,
      })
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (res.ok) setEnviado(true)
      else setErrorForm('No se pudo enviar. Escríbenos a redfreska@gmail.com')
    } catch {
      setErrorForm('Error de red. Escríbenos a redfreska@gmail.com')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf8]/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Red Freska" className="h-8 w-8 rounded-xl object-cover" />
            <span className="font-black text-gray-900 text-base tracking-tight">Red Freska</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            {[['#como-funciona','Cómo funciona'],['#cultura','Cultura'],['#equipo','Equipo'],['#contacto','Contacto']].map(([href,label]) => (
              <a key={href} href={href} className="hover:text-gray-900 transition">{label}</a>
            ))}
          </div>
          <Link
            to="/login"
            className="hidden md:flex items-center gap-1.5 bg-[#1a1a2e] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#534AB7] transition-all duration-300"
          >
            Acceder →
          </Link>
          <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-current" />
              <span className="block w-6 h-0.5 bg-current" />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {[['#como-funciona','Cómo funciona'],['#cultura','Cultura'],['#equipo','Equipo'],['#contacto','Contacto']].map(([href,label]) => (
              <a key={href} href={href} className="block text-sm text-gray-600 font-medium" onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <Link to="/login" className="block bg-[#1a1a2e] text-white text-sm font-bold px-5 py-2.5 rounded-full text-center mt-2">Acceder →</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 min-h-screen flex flex-col lg:flex-row">

        {/* Texto */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-[#534AB7]/10 text-[#534AB7] text-xs font-bold px-3.5 py-1.5 rounded-full mb-8 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#534AB7] animate-pulse" />
            Avalado por UTEC Lima
          </div>

          <h1 className="text-5xl xl:text-7xl font-black text-[#1a1a2e] leading-[0.95] mb-6 tracking-tight">
            Tu marca<br />
            <span className="text-[#534AB7]">merece</span><br />
            conectar.
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
            Red Freska analiza tendencias culturales con IA y te dice cuáles activar — con score, brief y estrategia lista para tu equipo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#contacto"
              className="flex items-center justify-center gap-2 bg-[#1a1a2e] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[#534AB7] transition-all duration-300 text-sm"
            >
              Quiero una demo →
            </a>
            <a
              href="#como-funciona"
              className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-full hover:border-[#534AB7] hover:text-[#534AB7] transition-all duration-300 text-sm"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* Mosaico de imágenes */}
        <div className="flex-1 relative order-1 lg:order-2 h-[60vh] lg:h-auto overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-4">
            <Img
              src={IMGS.foto1}
              className="col-span-1 row-span-2 w-full h-full object-cover rounded-3xl"
              fallback="#2d1b69"
            />
            <Img
              src={IMGS.foto3}
              className="w-full h-full object-cover rounded-3xl"
              fallback="#1a1a4e"
            />
            <Img
              src={IMGS.foto6}
              className="w-full h-full object-cover rounded-3xl"
              fallback="#0f3460"
            />
          </div>
          {/* Logo flotante */}
          <div className="absolute bottom-8 left-8 bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2.5">
            <img src={logo} className="w-10 h-10 rounded-xl object-cover" alt="logo" />
            <div>
              <p className="text-xs font-black text-gray-900 leading-tight">Red Freska</p>
              <p className="text-[10px] text-gray-400">Cultural Intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATEMENT ── */}
      <section className="bg-[#1a1a2e] py-20 px-8 text-center">
        <p className="text-3xl md:text-5xl font-black text-white max-w-4xl mx-auto leading-tight">
          Las marcas que conectan no son las más grandes.{' '}
          <span className="text-[#534AB7]">Son las más culturalmente relevantes.</span>
        </p>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-8 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '17',   label: 'Tendencias detectadas', sub: 'y creciendo' },
            { n: '3',    label: 'Marcas piloto',          sub: 'food & beverage' },
            { n: '80',   label: 'Videos analizados',      sub: 'por corrida' },
            { n: '< 5m', label: 'Detección completa',     sub: 'con IA' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-5xl font-black text-[#1a1a2e] mb-1">{s.n}</p>
              <p className="text-sm font-bold text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EL PROBLEMA ── */}
      <section className="py-0 flex flex-col lg:flex-row min-h-[80vh]">
        {/* Imagen */}
        <div className="lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
          <Img
            src={IMGS.foto2}
            className="w-full h-full object-cover"
            fallback="#2d1b69"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#fafaf8] hidden lg:block" />
        </div>

        {/* Texto */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-4">El problema</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-8">
            Adivinar qué tendencia activar es caro.
          </h2>

          <div className="space-y-4">
            {[
              { icon: '✗', label: 'Sin Red Freska', items: ['Horas en TikTok sin conclusiones claras', 'Decisiones por intuición o por lo que vio la competencia', 'Briefs que tardan días y nadie ejecuta'], dark: false },
              { icon: '✓', label: 'Con Red Freska', items: ['Score cultural 0–100 por tendencia y por marca', 'Brief ejecutable en minutos, en el tono de tu marca', 'Solo ves lo que es relevante para ti'], dark: true },
            ].map(col => (
              <div
                key={col.label}
                className={`rounded-2xl p-5 ${col.dark ? 'bg-[#1a1a2e] text-white' : 'bg-gray-50 border border-gray-200'}`}
              >
                <p className={`text-xs font-bold mb-3 ${col.dark ? 'text-[#534AB7]' : 'text-gray-400'}`}>{col.label}</p>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item} className={`text-sm flex items-start gap-2 ${col.dark ? 'text-white/80' : 'text-gray-600'}`}>
                      <span className={`shrink-0 font-bold ${col.dark ? 'text-[#534AB7]' : 'text-gray-300'}`}>{col.icon}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">El proceso</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e]">Tres pasos.</h2>
            <p className="text-gray-500 mt-3 text-lg">TikTok → Score → Brief ejecutable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01', titulo: 'Detectamos',
                desc: 'Analizamos cientos de videos en tiempo real. Claude extrae tendencias culturales con verdadero potencial.',
                img: IMGS.foto7, color: '#534AB7', bg: '#534AB710',
              },
              {
                n: '02', titulo: 'Evaluamos',
                desc: 'Score cultural 0–100 por marca: Público (40%), Territorio (35%), Tono (25%). Personalizado para ti.',
                img: IMGS.foto5, color: '#f59e0b', bg: '#f59e0b10',
              },
              {
                n: '03', titulo: 'Accionamos',
                desc: 'Brief listo: ángulo narrativo, plataformas y call to action en el tono exacto de tu marca.',
                img: IMGS.foto4, color: '#22c55e', bg: '#22c55e10',
              },
            ].map(paso => (
              <div key={paso.n} className="group rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="h-52 overflow-hidden relative">
                  <Img
                    src={paso.img}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallback={paso.bg}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-4 left-5 text-6xl font-black text-white/20 leading-none select-none">{paso.n}</span>
                </div>
                <div className="p-6">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 text-lg font-black" style={{ backgroundColor: paso.bg, color: paso.color }}>
                    {paso.n.slice(1)}
                  </div>
                  <h3 className="text-xl font-black text-[#1a1a2e] mb-2">{paso.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CULTURA EN TIEMPO REAL ── */}
      <section id="cultura" className="py-4 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 px-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">Cultura en tiempo real</p>
            <h2 className="text-4xl font-black text-[#1a1a2e]">Esto es lo que analizamos</h2>
            <p className="text-gray-500 mt-3">Cada imagen es una tendencia. Cada tendencia, una oportunidad para tu marca.</p>
          </div>

          {/* Mosaico con todas tus fotos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 md:row-span-2">
              <Img src={IMGS.foto8} className="w-full h-64 md:h-full object-cover rounded-3xl" fallback="#2d1b69" />
            </div>
            <Img src={IMGS.foto9}  className="w-full h-40 object-cover rounded-3xl" fallback="#1a4e3f" />
            <Img src={IMGS.foto10} className="w-full h-40 object-cover rounded-3xl" fallback="#4e1a3f" />
            <Img src={IMGS.foto11} className="w-full h-40 object-cover rounded-3xl" fallback="#3f1a4e" />
            <Img src={IMGS.foto12} className="w-full h-40 object-cover rounded-3xl" fallback="#1a3f4e" />
          </div>

          {/* Segunda fila de fotos */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3">
            {[IMGS.foto13, IMGS.foto14, IMGS.foto15, IMGS.foto16, IMGS.foto4].map((src, i) => (
              <Img key={i} src={src} className="w-full h-32 object-cover rounded-2xl" fallback="#1a1a2e" />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">Plataforma completa</p>
            <h2 className="text-4xl font-black text-[#1a1a2e]">Todo lo que necesita tu equipo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🧠', titulo: 'Score cultural con IA',         desc: 'Cada tendencia evaluada contra el ADN de tu marca. No intuición — datos.' },
              { icon: '🎯', titulo: 'Personalizado por marca',        desc: 'El mismo fenómeno viral puede ser oro para una marca y ruido para otra.' },
              { icon: '⚡', titulo: 'Brief ejecutable al instante',   desc: 'De tendencia detectada a brief listo en minutos.' },
              { icon: '📈', titulo: 'Momentum de tendencia',          desc: 'Emergente, en pico o establecida. El timing es todo en marketing.' },
              { icon: '🍽️', titulo: 'Relevancia food 1–5',           desc: 'Solo llegan las tendencias que pueden conectar con tu producto.' },
              { icon: '🔒', titulo: 'Panel admin completo',           desc: 'Aprueba tendencias y controla exactamente qué ve cada cliente.' },
            ].map(f => (
              <div key={f.titulo} className="p-6 rounded-2xl border border-gray-100 bg-[#fafaf8] hover:border-[#534AB7]/30 hover:bg-white hover:shadow-sm transition-all duration-300 group">
                <span className="text-3xl block mb-4">{f.icon}</span>
                <h3 className="font-black text-[#1a1a2e] mb-2 text-base">{f.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACK ── */}
      <section className="py-16 px-8 bg-[#1a1a2e]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-8">Tecnología</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { n: 'React + Tailwind', c: '#0ea5e9' },
              { n: 'FastAPI + Python', c: '#f59e0b' },
              { n: 'Supabase', c: '#22c55e' },
              { n: 'Claude AI (Anthropic)', c: '#534AB7' },
              { n: 'Apify', c: '#ef4444' },
            ].map(t => (
              <div key={t.n} className="flex items-center gap-2 border border-white/10 rounded-full px-5 py-2.5 bg-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.c }} />
                <span className="text-sm font-medium text-white/70">{t.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EQUIPO ── */}
      <section id="equipo" className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#534AB7] mb-3">Equipo</p>
            <h2 className="text-4xl font-black text-[#1a1a2e]">Quiénes somos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                nombre: 'Haydi Landa Vilchez',
                rol: 'UX & Research',
                desc: 'Diseño de experiencia, comprensión del usuario y recopilación de insights. Traduce la voz del mercado en decisiones de producto.',
                color: '#534AB7', inicial: 'H',
              },
              {
                nombre: 'Harold Inca Tenorio',
                rol: 'Backend & Arquitectura',
                desc: 'Diseño de base de datos, integración backend–frontend e infraestructura de APIs. La estructura que sostiene toda la plataforma.',
                color: '#0ea5e9', inicial: 'H',
              },
            ].map(p => (
              <div key={p.nombre} className="flex gap-5 p-7 rounded-2xl border border-gray-100 bg-[#fafaf8] hover:shadow-md transition-all duration-300">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.inicial}
                </div>
                <div>
                  <p className="font-black text-[#1a1a2e] text-lg">{p.nombre}</p>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-1 mb-3"
                    style={{ backgroundColor: p.color + '15', color: p.color }}
                  >
                    {p.rol}
                  </span>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* UTEC badge */}
          <div className="flex items-center gap-5 bg-[#534AB7]/5 border border-[#534AB7]/10 rounded-2xl p-6">
            <img src={logo} alt="UTEC" className="h-14 w-14 rounded-xl object-cover shrink-0" />
            <div>
              <p className="font-black text-[#1a1a2e] text-base">Avalado por UTEC Lima</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                Red Freska es un proyecto desarrollado bajo el respaldo académico de la Universidad de Ingeniería y Tecnología — UTEC Lima, una de las universidades de ingeniería más reconocidas del Perú.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA + FORM ── */}
      <section id="contacto" className="relative overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Img src={IMGS.foto3} className="w-full h-full object-cover opacity-20" fallback="#1a1a2e" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e]/95 to-[#534AB7]/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Contacto</p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              ¿Lista tu marca para conectar?
            </h2>
            <p className="text-white/60 leading-relaxed mb-8 text-base">
              Agenda una demo y te mostramos en vivo cómo Red Freska analiza tendencias y genera briefs personalizados para tu equipo de marketing.
            </p>
            <ul className="space-y-3 mb-8">
              {['Sin compromiso', 'Demo personalizada con tu marca', 'Resultados en tiempo real'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 rounded-full bg-[#534AB7] flex items-center justify-center shrink-0 text-white text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a href="mailto:redfreska@gmail.com" className="text-sm text-white/40 hover:text-white/70 transition">
              redfreska@gmail.com
            </a>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {enviado ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-black text-[#1a1a2e] mb-2">¡Mensaje recibido!</h3>
                <p className="text-sm text-gray-500">Te contactamos en las próximas 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-black text-[#1a1a2e] text-xl mb-6">Solicitar demo</h3>
                {[
                  { k: 'nombre',  label: 'Tu nombre',            ph: 'María García',              type: 'text' },
                  { k: 'empresa', label: 'Restaurante / empresa', ph: 'Bembos, La Lucha...',       type: 'text' },
                  { k: 'email',   label: 'Email de contacto',     ph: 'maria@turestaurante.com',   type: 'email' },
                ].map(f => (
                  <div key={f.k}>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">{f.label}</label>
                    <input
                      type={f.type} required
                      value={form[f.k]} onChange={e => set(f.k, e.target.value)}
                      placeholder={f.ph}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300 bg-[#fafaf8]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">¿Qué te interesa explorar?</label>
                  <textarea
                    value={form.mensaje} onChange={e => set('mensaje', e.target.value)}
                    rows={3} placeholder="Cuéntanos sobre tu marca..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/50 transition placeholder:text-gray-300 resize-none bg-[#fafaf8]"
                  />
                </div>
                {errorForm && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{errorForm}</p>}
                <button
                  type="submit" disabled={enviando}
                  className="w-full bg-[#1a1a2e] hover:bg-[#534AB7] text-white font-black py-3.5 rounded-full transition-all duration-300 disabled:opacity-60 text-sm"
                >
                  {enviando ? 'Enviando...' : 'Solicitar demo →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-8 bg-[#0d0d1a] border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Red Freska" className="h-7 w-7 rounded-lg object-cover" />
            <span className="font-black text-white/80 text-sm">Red Freska</span>
          </div>
          <p className="text-xs text-white/20 text-center">
            Cultural Intelligence Platform · Avalado por UTEC Lima · 2025
          </p>
          <a href="mailto:redfreska@gmail.com" className="text-xs text-[#534AB7] hover:text-[#7b74e0] transition font-semibold">
            redfreska@gmail.com
          </a>
        </div>
      </footer>

    </div>
  )
}
