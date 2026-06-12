import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getTendencias, getScores, getMarcas, cambiarEstadoTendencia,
  scoringBatch, cancelarScoring, uploadCSV, uploadXLSX,
  iniciarDeteccion, estadoDeteccion, deleteTendencia,
} from '../lib/api'
import { getScoreEstado } from '../lib/mockData'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ScoreCard from '../components/ScoreCard'
import { Upload, Cpu, CheckCircle, Clock, XCircle, ChevronDown, Database, ListChecks, Sparkles, Trash2, AlertTriangle } from 'lucide-react'

const ESTADOS_INFO = {
  publicada: { label: 'Publicado', color: 'green', icon: CheckCircle },
  revisar:   { label: 'Revisar',   color: 'yellow', icon: Clock },
  rechazada: { label: 'Rechazado', color: 'red',    icon: XCircle },
}

const estadoBadge = {
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-600',
}

const scoreColor = (score) => {
  if (!score && score !== 0) return 'text-gray-200'
  if (score >= 65) return 'text-green-600 font-semibold'
  if (score >= 50) return 'text-yellow-600 font-semibold'
  return 'text-red-500 font-semibold'
}

// Iniciales de la marca: "Papa John's" → "PJ", "Starbucks" → "ST"
function getInitials(nombre) {
  const words = nombre.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

const chipStyle = {
  green:  'bg-green-50 border border-green-100 text-green-700',
  yellow: 'bg-yellow-50 border border-yellow-100 text-yellow-700',
  red:    'bg-red-50 border border-red-100 text-red-500',
  none:   'bg-gray-50 border border-gray-100 text-gray-300',
}

export default function Admin() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const xlsxRef = useRef()

  const [tendencias, setTendencias] = useState([])
  const [allScores, setAllScores] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [scoringDone, setScoringDone] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [detectando, setDetectando] = useState(false)
  const [deteccionMsg, setDeteccionMsg] = useState(null)
  const [tendenciaAEliminar, setTendenciaAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const pollingRef = useRef(null)
  const deteccionRef = useRef(null)

  useEffect(() => {
    cargarDatos()
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const [tends, scs, mrcs] = await Promise.all([
        getTendencias(),
        getScores(),
        getMarcas(),
      ])
      setTendencias(tends)
      setAllScores(scs)
      setMarcas(mrcs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function recargarScores() {
    try {
      const [tends, scs] = await Promise.all([getTendencias(), getScores()])
      setTendencias(tends)
      setAllScores(scs)
    } catch { /* silencioso */ }
  }

  async function handleEstado(id, estado) {
    setTendencias((prev) =>
      prev.map((t) => t.id === id ? { ...t, estado } : t)
    )
    try {
      await cambiarEstadoTendencia(id, estado)
    } catch {
      await cargarDatos()
    }
  }

  async function handleScoring() {
    setScoring(true)
    setScoringDone(false)
    if (pollingRef.current) clearInterval(pollingRef.current)
    try {
      await scoringBatch(null, null)
      // El backend procesa en background — hacer polling cada 8s para ver progreso
      pollingRef.current = setInterval(recargarScores, 8000)
      // Detener polling a los 5 minutos
      setTimeout(() => {
        if (pollingRef.current) clearInterval(pollingRef.current)
        setScoring(false)
        setScoringDone(true)
        recargarScores()
      }, 300000)
    } catch (e) {
      console.error(e)
      setScoring(false)
    }
  }

  async function handleDetectar() {
    setDetectando(true)
    setDeteccionMsg(null)
    try {
      await iniciarDeteccion()
      // Polling cada 8s para saber cuándo terminó
      deteccionRef.current = setInterval(async () => {
        try {
          const estado = await estadoDeteccion()
          setDeteccionMsg(estado.corriendo ? { fase: estado.fase } : null)
          if (!estado.corriendo) {
            clearInterval(deteccionRef.current)
            setDetectando(false)
            if (estado.error) {
              setDeteccionMsg({ tipo: 'error', texto: `Error: ${estado.error}` })
            } else if (estado.ultimo_resultado) {
              const r = estado.ultimo_resultado
              setDeteccionMsg({
                tipo: 'ok',
                texto: `${r.nuevas_insertadas} tendencias nuevas · ${r.scores_calculados} scores calculados automáticamente`,
              })
              await recargarScores()
            }
          }
        } catch { /* silencioso */ }
      }, 8000)
    } catch (e) {
      setDetectando(false)
      setDeteccionMsg({ tipo: 'error', texto: e.message })
    }
  }

  async function handleCancelar() {
    try {
      await cancelarScoring()
    } catch { /* ignorar */ }
    if (pollingRef.current) clearInterval(pollingRef.current)
    setScoring(false)
    await recargarScores()
  }

  async function handleCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadMsg(null)
    setUploadError(null)
    try {
      const res = await uploadCSV(file)
      setUploadMsg(res.mensaje)
      await cargarDatos()
    } catch (err) {
      setUploadError(err.message)
    }
    e.target.value = ''
  }

  async function handleXLSX(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadMsg(null)
    setUploadError(null)
    try {
      const res = await uploadXLSX(file)
      setUploadMsg(res.mensaje)
      await cargarDatos()
    } catch (err) {
      setUploadError(err.message)
    }
    e.target.value = ''
  }

  const totalScored = tendencias.filter((t) =>
    allScores.some((s) => s.tendencia_id === t.id)
  ).length
  const pendientes = tendencias.filter((t) => t.estado === 'revisar').length

  function getScoreMarca(tendenciaId, marcaId) {
    return allScores.find((s) => s.tendencia_id === tendenciaId && s.marca_id === marcaId)
  }

  async function handleEliminar() {
    if (!tendenciaAEliminar) return
    setEliminando(true)
    try {
      await deleteTendencia(tendenciaAEliminar.id)
      setTendencias((prev) => prev.filter((t) => t.id !== tendenciaAEliminar.id))
      setAllScores((prev) => prev.filter((s) => s.tendencia_id !== tendenciaAEliminar.id))
      setTendenciaAEliminar(null)
    } catch (e) {
      console.error(e)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Modal de confirmación de eliminación */}
      {tendenciaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">¿Eliminar tendencia?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              <span className="font-semibold text-gray-700">"{tendenciaAEliminar.nombre}"</span>
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">
              Se eliminarán también todos los scores asociados. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTendenciaAEliminar(null)}
                disabled={eliminando}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-400 mt-0.5">Gestión de tendencias, scores y marcas</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
              <input ref={xlsxRef} type="file" accept=".xlsx,.xlsm" className="hidden" onChange={handleXLSX} />
              <button
                onClick={handleDetectar}
                disabled={detectando}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-60"
              >
                <Sparkles size={15} className={detectando ? 'animate-pulse' : ''} />
                {detectando ? (deteccionMsg?.fase === 'scoring' ? 'Calculando scores...' : deteccionMsg?.fase === 'detectando' ? 'Claude analizando...' : 'Scrapeando TikTok...') : 'Detectar con IA'}
              </button>
              <button
                onClick={() => fileRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                <Upload size={15} /> Subir CSV
              </button>
              <button
                onClick={() => xlsxRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
              >
                <Upload size={15} /> Subir Excel + Scores
              </button>
              {scoring ? (
                <button
                  onClick={handleCancelar}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
                >
                  <XCircle size={15} /> Detener scoring
                </button>
              ) : (
                <button
                  onClick={handleScoring}
                  className="flex items-center gap-2 px-4 py-2 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#453da0] transition"
                >
                  <Cpu size={15} /> Correr scoring
                </button>
              )}
            </div>
          </div>

          {/* Notificaciones */}
          {deteccionMsg && (
            <div className={`text-sm rounded-xl px-4 py-3 flex items-center gap-2 ${
              deteccionMsg.tipo === 'ok'
                ? 'bg-violet-50 border border-violet-200 text-violet-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <Sparkles size={15} /> {deteccionMsg.texto}
            </div>
          )}
          {uploadMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle size={15} /> {uploadMsg}
            </div>
          )}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              Error: {uploadError}
            </div>
          )}
          {scoringDone && (
            <div className="bg-[#534AB7]/10 border border-[#534AB7]/20 text-[#534AB7] text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle size={15} /> Scoring completado para todas las tendencias y marcas.
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreCard label="Tendencias cargadas" value={loading ? '—' : tendencias.length} sub="En total" icon={Database} color="#534AB7" />
            <ScoreCard label="Scored" value={loading ? '—' : totalScored} sub="Con score calculado" icon={Cpu} color="#22c55e" />
            <ScoreCard label="Pendientes de aprobar" value={loading ? '—' : pendientes} sub="Estado: Revisar" icon={ListChecks} color="#f59e0b" />
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">Tendencias × Marcas</h2>
              <p className="text-xs text-gray-400">Haz clic en una tendencia para ver el detalle</p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-64">Tendencia</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Estado</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Marcas</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-24">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tendencias.map((t) => {
                      const est = t.estado
                      const estInfo = ESTADOS_INFO[est] ?? ESTADOS_INFO.revisar
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => navigate(`/tendencia/${t.id}`)}
                              className="text-left hover:text-[#534AB7] font-medium text-gray-800 transition"
                            >
                              {t.nombre}
                            </button>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <p className="text-xs text-gray-400">{t.fuente}</p>
                              {t.momentum && (
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                                  t.momentum === 'pico'       ? 'bg-green-100 text-green-700' :
                                  t.momentum === 'emergente'  ? 'bg-blue-100 text-blue-600' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  {t.momentum === 'pico' ? '🔥 pico' : t.momentum === 'emergente' ? '📈 emergente' : '📊 establecida'}
                                </span>
                              )}
                              {t.relevancia_food != null && (
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                                  t.relevancia_food >= 4 ? 'bg-orange-100 text-orange-700' :
                                  t.relevancia_food >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-400'
                                }`}>
                                  food {t.relevancia_food}/5
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="relative inline-block">
                              <select
                                value={est}
                                onChange={(e) => handleEstado(t.id, e.target.value)}
                                className={`appearance-none text-xs font-semibold px-2.5 py-1 rounded-full pr-6 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 ${estadoBadge[estInfo.color]}`}
                              >
                                <option value="publicada">Publicado</option>
                                <option value="revisar">Revisar</option>
                                <option value="rechazada">Rechazado</option>
                              </select>
                              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex flex-wrap gap-1.5">
                              {marcas.map((m) => {
                                const s = getScoreMarca(t.id, m.id)
                                const estado = s ? getScoreEstado(s.score_final) : null
                                const colorKey = estado?.color ?? 'none'
                                return (
                                  <div
                                    key={m.id}
                                    title={`${m.nombre}: ${s ? s.score_final : 'sin score'}`}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${chipStyle[colorKey]}`}
                                  >
                                    <span className="font-bold opacity-60">{getInitials(m.nombre)}</span>
                                    <span>{s ? s.score_final : '—'}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/tendencia/${t.id}`)}
                                className="text-xs text-[#534AB7] hover:underline font-medium"
                              >
                                Ver detalle
                              </button>
                              <a
                                href={`https://www.tiktok.com/search?q=${encodeURIComponent(t.nombre)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver en TikTok"
                                className="p-1.5 rounded-lg text-gray-300 hover:text-black hover:bg-gray-100 transition"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                                </svg>
                              </a>
                              <button
                                onClick={() => setTendenciaAEliminar(t)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                                title="Eliminar tendencia"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {tendencias.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">
                          No hay tendencias. Sube un CSV para empezar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
