import { useEffect, useState } from 'react'
import { useAuth } from '../App'
import { getTendencias, getScores } from '../lib/api'
import { getScoreEstado, EVOLUCION_SCORE } from '../lib/mockData'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ScoreCard from '../components/ScoreCard'
import TendenciaRow from '../components/TendenciaRow'
import { TrendingUp, Star, Bell, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const ALERTAS = [
  { id: 1, texto: 'Nueva tendencia detectada y lista para evaluar', tiempo: 'Hace 2h', icon: CheckCircle, color: 'green' },
  { id: 2, texto: 'Score promedio subió 7 puntos esta semana', tiempo: 'Hace 5h', icon: TrendingUp, color: 'blue' },
  { id: 3, texto: 'Brief pendiente de revisión en panel admin', tiempo: 'Ayer', icon: AlertCircle, color: 'yellow' },
]

const alertaStyles = {
  green: { bg: 'bg-green-50', icon: 'text-green-500', border: 'border-green-100' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-100' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-500', border: 'border-yellow-100' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tendencias, setTendencias] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const marcaId = user?.marca_id

  useEffect(() => {
    async function cargar() {
      try {
        const [tends, scs] = await Promise.all([
          getTendencias(),
          getScores(marcaId),
        ])
        setTendencias(tends)
        setScores(scs)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [marcaId])

  // Solo mostramos tendencias con score ≥ 50 (verde + amarillo)
  // Las rojas no son accionables para el cliente — no tiene sentido mostrarlas
  const tendenciasConScore = tendencias
    .map((t) => {
      const s = scores.find((sc) => sc.tendencia_id === t.id)
      return s ? { tendencia: t, score: s } : null
    })
    .filter((ts) => ts !== null && ts.score.score_final >= 50)
    .sort((a, b) => b.score.score_final - a.score.score_final)

  const activar    = tendenciasConScore.filter((ts) => ts.score.score_final >= 65).length
  const porEvaluar = tendenciasConScore.filter((ts) => ts.score.score_final >= 50 && ts.score.score_final < 65).length
  const scoreMax   = tendenciasConScore.length ? Math.max(...tendenciasConScore.map((ts) => ts.score.score_final)) : 0
  const scoreMasAlto  = tendenciasConScore.find((ts) => ts.score.score_final === scoreMax)
  const briefsListos  = scores.filter((s) => s.activar && s.brief).length

  // Evolución usa mock por ahora hasta tener datos históricos reales
  const evolucion = marcaId ? (EVOLUCION_SCORE[marcaId] ?? []) : []

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              Error cargando datos: {error}
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard label="Listas para activar" value={loading ? '—' : activar} sub="Score ≥ 65 · Verde" icon={TrendingUp} color="#534AB7" />
            <ScoreCard label="Por evaluar" value={loading ? '—' : porEvaluar} sub="Score 50–64 · Tú decides" icon={Star} color="#f59e0b" />
            <ScoreCard label="Score más alto" value={loading ? '—' : scoreMax} sub={scoreMasAlto?.tendencia.nombre ?? '—'} icon={Bell} color="#22c55e" />
            <ScoreCard label="Briefs listos" value={loading ? '—' : briefsListos} sub="Para descargar" icon={FileText} color="#ef4444" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Tendencias */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-800 text-sm">Top tendencias de la semana</h2>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Activar ≥65</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Evaluar 50–64</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> No activar</span>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Cargando tendencias...</div>
              ) : tendenciasConScore.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No hay tendencias con score aún. El admin debe correr el scoring.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tendenciasConScore.map(({ tendencia, score }) => (
                    <TendenciaRow key={tendencia.id} tendencia={tendencia} score={score} />
                  ))}
                </div>
              )}
            </div>

            {/* Panel derecho */}
            <div className="space-y-4">
              {/* Alertas */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 text-sm mb-4">Alertas recientes</h2>
                <div className="space-y-3">
                  {ALERTAS.map((alerta) => {
                    const style = alertaStyles[alerta.color]
                    const Icon = alerta.icon
                    return (
                      <div key={alerta.id} className={`flex gap-3 p-3 rounded-xl border ${style.bg} ${style.border}`}>
                        <Icon size={16} className={`${style.icon} shrink-0 mt-0.5`} />
                        <div>
                          <p className="text-xs text-gray-700 leading-snug">{alerta.texto}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={11} />{alerta.tiempo}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Gráfica */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 text-sm mb-1">Evolución del score</h2>
                <p className="text-xs text-gray-400 mb-4">Promedio mensual · 2025</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={evolucion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="score" stroke="#534AB7" strokeWidth={2.5} dot={{ fill: '#534AB7', r: 4 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
