import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { getTendencia, getScore, getScores, getMarcas, registrarFeedback } from '../lib/api'
import { getScoreEstado } from '../lib/mockData'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ScoreGauge from '../components/ScoreGauge'
import Brief from '../components/Brief'
import { jsPDF } from 'jspdf'
import {
  ArrowLeft, Download, ThumbsUp, ThumbsDown, Minus,
  CalendarDays, Globe, Tag, ExternalLink,
} from 'lucide-react'

const DIMENSIONES = [
  { key: 'score_publico', label: 'Público', peso: '40%', color: '#534AB7' },
  { key: 'score_territorio', label: 'Territorio', peso: '35%', color: '#0ea5e9' },
  { key: 'score_tono', label: 'Tono', peso: '25%', color: '#8b5cf6' },
]

const MARCA_COLORS = {
  'Norkys':      '#ef4444',
  "Papa John's": '#22c55e',
  'Starbucks':   '#f59e0b',
}

export default function DetalleTendencia() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.rol === 'admin'

  const [tendencia, setTendencia] = useState(null)
  const [score, setScore] = useState(null)
  const [allScores, setAllScores] = useState([])
  const [marcas, setMarcas] = useState([])
  const [marcaActivaId, setMarcaActivaId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const t = await getTendencia(id)
        setTendencia(t)
      } catch (e) {
        setError(e.message)
        setLoading(false)
        return
      }

      if (isAdmin) {
        try {
          const [scores, mrcs] = await Promise.all([
            getScores(null, id),
            getMarcas(),
          ])
          setAllScores(scores)
          setMarcas(mrcs)
          if (mrcs.length > 0) {
            const firstId = mrcs[0].id
            setMarcaActivaId(firstId)
            setScore(scores.find(s => s.marca_id === firstId) ?? null)
          }
        } catch {
          // sin scores aún
        }
      } else {
        try {
          const s = await getScore(id)
          setScore(s)
        } catch {
          // sin score aún
        }
      }

      setLoading(false)
    }
    cargar()
  }, [id, isAdmin])

  function seleccionarMarca(marcaId) {
    setMarcaActivaId(marcaId)
    setScore(allScores.find(s => s.marca_id === marcaId) ?? null)
    setFeedback(null)
    setFeedbackEnviado(false)
  }

  function descargarPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210
    const margin = 18
    const col = W - margin * 2
    let y = 0

    // Header morado
    doc.setFillColor(83, 74, 183)
    doc.rect(0, 0, W, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Red Freska', margin, 13)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Cultural Fit Score — Brief Ejecutable', margin, 21)
    y = 38

    // Nombre tendencia
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    const lines = doc.splitTextToSize(tendencia.nombre, col)
    doc.text(lines, margin, y)
    y += lines.length * 7 + 2

    // Meta
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(`${tendencia.fuente}   •   ${tendencia.categoria}   •   ${tendencia.fecha ?? tendencia.creada_at?.slice(0,10) ?? ''}`, margin, y)
    y += 10

    // Score box
    const estado = getScoreEstado(score.score_final)
    doc.setFillColor(245, 245, 250)
    doc.roundedRect(margin, y, col, 22, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(83, 74, 183)
    doc.text(`${score.score_final}`, margin + 8, y + 14)
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('/ 100', margin + 26, y + 14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    const estadoColor = estado.color === 'green' ? [34,197,94] : estado.color === 'yellow' ? [234,179,8] : [239,68,68]
    doc.setTextColor(...estadoColor)
    doc.text(estado.label.toUpperCase(), margin + 50, y + 14)
    y += 30

    // Razón
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const razonLines = doc.splitTextToSize(score.razon ?? '', col)
    doc.text(razonLines, margin, y)
    y += razonLines.length * 5 + 8

    // Desglose
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    doc.text('Desglose por dimensión', margin, y)
    y += 6
    const dims = [
      { label: 'Público (40%)', val: score.score_publico, color: [83,74,183] },
      { label: 'Territorio (35%)', val: score.score_territorio, color: [14,165,233] },
      { label: 'Tono (25%)', val: score.score_tono, color: [139,92,246] },
    ]
    dims.forEach(({ label, val, color }) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      doc.text(`${label}`, margin, y + 4)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...color)
      doc.text(`${val}/10`, margin + col - 10, y + 4)
      doc.setFillColor(230, 230, 240)
      doc.roundedRect(margin, y + 6, col, 3, 1, 1, 'F')
      doc.setFillColor(...color)
      doc.roundedRect(margin, y + 6, col * (val / 10), 3, 1, 1, 'F')
      y += 14
    })
    y += 4

    // Brief
    if (score.brief) {
      doc.setDrawColor(230, 230, 240)
      doc.line(margin, y, W - margin, y)
      y += 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(30, 30, 30)
      doc.text('Brief Ejecutable', margin, y)
      y += 8

      const secciones = [
        { titulo: 'Ángulo narrativo', texto: score.brief.angulo },
        { titulo: 'Formato recomendado', texto: score.brief.formato },
        { titulo: 'Call to action', texto: score.brief.cta },
      ]
      secciones.forEach(({ titulo, texto }) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(83, 74, 183)
        doc.text(titulo, margin, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 50, 50)
        const tLines = doc.splitTextToSize(texto ?? '', col)
        doc.text(tLines, margin, y)
        y += tLines.length * 5 + 6
      })
    } else {
      doc.setDrawColor(230, 230, 240)
      doc.line(margin, y, W - margin, y)
      y += 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30, 30, 30)
      doc.text('Sobre esta tendencia', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      const descLines = doc.splitTextToSize(tendencia.descripcion ?? '', col)
      doc.text(descLines, margin, y)
    }

    // Footer
    doc.setFillColor(83, 74, 183)
    doc.rect(0, 287, W, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Red Freska — Cultural Intelligence Platform', margin, 293)
    doc.text(new Date().toLocaleDateString('es-PE'), W - margin - 20, 293)

    doc.save(`brief_${tendencia.nombre.replace(/\s+/g, '_')}.pdf`)
  }

  async function enviarFeedback() {
    try {
      await registrarFeedback(score.id, true, feedback, null)
      setFeedbackEnviado(true)
    } catch {
      setFeedbackEnviado(true)
    }
  }

  const estadoColors = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-600',
  }

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Cargando tendencia...
      </div>
    </div>
  )

  if (error || !tendencia) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        {error || 'Tendencia no encontrada.'}
      </div>
    </div>
  )

  const estado = score ? getScoreEstado(score.score_final) : null
  const marcaActiva = marcas.find(m => m.id === marcaActivaId)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-5xl space-y-6">

          {/* Header */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-4"
            >
              <ArrowLeft size={16} /> Volver al dashboard
            </button>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {estado ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoColors[estado.color]}`}>
                      {estado.label}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
                      Pendiente de scoring
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Tag size={11} /> {tendencia.categoria}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{tendencia.nombre}</h1>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Globe size={12} /> {tendencia.fuente}</span>
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> {tendencia.fecha ?? tendencia.creada_at?.slice(0, 10)}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* Ver en TikTok */}
                <a
                  href={`https://www.tiktok.com/search?q=${encodeURIComponent(tendencia.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                  </svg>
                  Ver en TikTok
                </a>

                {score?.activar && (
                  <button
                    onClick={descargarPDF}
                    className="flex items-center gap-2 bg-[#534AB7] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#453da0] transition"
                  >
                    <Download size={16} /> Descargar brief PDF
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs de marca — solo admin */}
          {isAdmin && marcas.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
              {marcas.map((m) => {
                const s = allScores.find(sc => sc.marca_id === m.id)
                const est = s ? getScoreEstado(s.score_final) : null
                const active = marcaActivaId === m.id
                const dotColor = MARCA_COLORS[m.nombre] ?? '#888'
                return (
                  <button
                    key={m.id}
                    onClick={() => seleccionarMarca(m.id)}
                    className={`flex-1 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      active
                        ? 'bg-[#534AB7] text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : dotColor }}
                      />
                      <span>{m.nombre}</span>
                    </div>
                    {s ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : est?.color === 'green'
                            ? 'bg-green-100 text-green-700'
                            : est?.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-600'
                      }`}>
                        {s.score_final}
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white/70' : 'text-gray-300'}`}>
                        —
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Score + desglose */}
          {score ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-4">
                <ScoreGauge score={score.score_final} />
                {isAdmin && marcaActiva && (
                  <p className="text-xs text-gray-400 font-medium">
                    Score para <span className="font-semibold text-gray-600">{marcaActiva.nombre}</span>
                  </p>
                )}
                <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">{score.razon}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-semibold text-gray-700">Desglose por dimensión</h3>
                {DIMENSIONES.map(({ key, label, peso, color }) => {
                  const val = score[key]
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700">{label} <span className="text-gray-400 font-normal">({peso})</span></span>
                        <span className="font-bold" style={{ color }}>{val}/10</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(val / 10) * 100}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-gray-50 text-xs text-gray-400">
                  Fórmula: (Público×40 + Territorio×35 + Tono×25) / 10
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-8 text-center">
              <p className="text-yellow-700 font-medium text-sm">
                {isAdmin && marcaActiva
                  ? `${marcaActiva.nombre} aún no tiene score para esta tendencia.`
                  : 'Esta tendencia aún no tiene score calculado.'}
              </p>
              <p className="text-yellow-500 text-xs mt-1">Haz clic en "Correr scoring" desde el Panel Admin.</p>
            </div>
          )}

          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sobre esta tendencia</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{tendencia.descripcion}</p>
          </div>

          {/* Videos de referencia */}
          {tendencia.videos_referencia?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Videos que originaron esta tendencia</h3>
                <span className="text-xs text-gray-400">{tendencia.videos_referencia.length} videos de referencia</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {tendencia.videos_referencia.map((video, i) => (
                  <a
                    key={i}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-black transition-all hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={`Video ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="opacity-60">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                          </svg>
                        </div>
                      )}
                      {/* Overlay con views */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                        <p className="text-white text-xs font-semibold">
                          {video.views >= 1_000_000
                            ? `${(video.views / 1_000_000).toFixed(1)}M`
                            : video.views >= 1_000
                              ? `${(video.views / 1_000).toFixed(0)}K`
                              : video.views} views
                        </p>
                      </div>
                      {/* Ícono play */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ExternalLink size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                    {/* Descripción */}
                    <div className="p-2">
                      <p className="text-xs text-gray-500 leading-tight line-clamp-2">
                        {video.descripcion || 'Ver en TikTok'}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Brief */}
          {score?.brief ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Brief ejecutable</h3>
              <Brief brief={score.brief} />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm">Score insuficiente para generar un brief. Mínimo: 65.</p>
            </div>
          )}

          {/* Feedback */}
          {score?.brief && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">¿Ejecutaron esta tendencia?</h3>
              <p className="text-xs text-gray-400 mb-4">Tu feedback mejora el modelo de scoring para tu marca.</p>

              {!feedbackEnviado ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  {[
                    { valor: 'bueno', label: 'Resultó bien', icon: ThumbsUp, color: 'green' },
                    { valor: 'regular', label: 'Resultados regulares', icon: Minus, color: 'yellow' },
                    { valor: 'malo', label: 'No funcionó', icon: ThumbsDown, color: 'red' },
                  ].map(({ valor, label, icon: Icon, color }) => {
                    const selected = feedback === valor
                    const colors = {
                      green: selected ? 'bg-green-100 border-green-400 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600',
                      yellow: selected ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'border-gray-200 text-gray-500 hover:border-yellow-300 hover:text-yellow-600',
                      red: selected ? 'bg-red-100 border-red-400 text-red-700' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600',
                    }
                    return (
                      <button key={valor} onClick={() => setFeedback(valor)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${colors[color]}`}>
                        <Icon size={15} />{label}
                      </button>
                    )
                  })}
                  {feedback && (
                    <button onClick={enviarFeedback}
                      className="px-4 py-2.5 bg-[#534AB7] text-white text-sm font-semibold rounded-xl hover:bg-[#453da0] transition">
                      Enviar feedback
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                  <ThumbsUp size={16} /> ¡Gracias! Tu feedback quedó registrado.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
