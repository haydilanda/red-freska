import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { getTendencias, getScores } from '../lib/api'
import { getScoreEstado } from '../lib/mockData'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Search, ChevronRight, SlidersHorizontal } from 'lucide-react'

// Tabs para admin: ven todo
const FILTROS_ADMIN = [
  { label: 'Todas', value: null },
  { label: 'Activar ≥65', value: 'activar' },
  { label: 'Evaluar 50–64', value: 'evaluar' },
  { label: 'No activar', value: 'no_activar' },
  { label: 'Sin score', value: 'sin_score' },
]

// Tabs para cliente: solo lo que les sirve
const FILTROS_CLIENTE = [
  { label: 'Todas', value: null },
  { label: 'Activar ≥65', value: 'activar' },
  { label: 'Por evaluar', value: 'evaluar' },
]

const estadoBadge = {
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-600',
}

const scoreBar = {
  green:  'bg-green-400',
  yellow: 'bg-yellow-400',
  red:    'bg-red-400',
}

export default function Tendencias() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tendencias, setTendencias] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [tends, scs] = await Promise.all([
          getTendencias(),
          getScores(user?.marca_id),
        ])
        setTendencias(tends)
        setScores(scs)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [user?.marca_id])

  const categorias = useMemo(() =>
    [...new Set(tendencias.map((t) => t.categoria).filter(Boolean))].sort(),
    [tendencias]
  )

  const isCliente = user?.rol === 'cliente'
  const filtrosEstado = isCliente ? FILTROS_CLIENTE : FILTROS_ADMIN

  const lista = useMemo(() => {
    return tendencias
      .map((t) => {
        const s = scores.find((sc) => sc.tendencia_id === t.id)
        return { tendencia: t, score: s ?? null }
      })
      .filter(({ score }) => {
        // Clientes solo ven score ≥ 50 (verde + amarillo)
        if (isCliente) {
          if (!score) return false
          if (score.score_final < 50) return false
        }
        return true
      })
      .filter(({ tendencia, score }) => {
        if (busqueda) {
          const q = busqueda.toLowerCase()
          if (!tendencia.nombre.toLowerCase().includes(q) &&
              !tendencia.categoria?.toLowerCase().includes(q) &&
              !tendencia.fuente?.toLowerCase().includes(q)) return false
        }
        if (filtroCategoria && tendencia.categoria !== filtroCategoria) return false
        if (filtroEstado) {
          if (filtroEstado === 'sin_score') return !score
          if (!score) return false
          const e = getScoreEstado(score.score_final)
          if (filtroEstado === 'activar'    && e.color !== 'green')  return false
          if (filtroEstado === 'evaluar'    && e.color !== 'yellow') return false
          if (filtroEstado === 'no_activar' && e.color !== 'red')    return false
        }
        return true
      })
      .sort((a, b) => {
        if (!a.score && !b.score) return 0
        if (!a.score) return 1
        if (!b.score) return -1
        return b.score.score_final - a.score.score_final
      })
  }, [tendencias, scores, busqueda, filtroEstado, filtroCategoria, isCliente])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-5xl space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-900">Tendencias</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isCliente
                ? `${lista.length} tendencias relevantes para tu marca`
                : `${tendencias.length} tendencias · ${scores.length} con score calculado`}
            </p>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, categoría o fuente..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30"
              />
            </div>
            <select
              value={filtroCategoria ?? ''}
              onChange={(e) => setFiltroCategoria(e.target.value || null)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tabs de estado — adaptados por rol */}
          <div className="flex gap-2 flex-wrap">
            {filtrosEstado.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setFiltroEstado(value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  filtroEstado === value
                    ? 'bg-[#534AB7] text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-[#534AB7]/40 hover:text-[#534AB7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Aviso explicativo para clientes */}
          {isCliente && (
            <div className="bg-[#534AB7]/5 border border-[#534AB7]/10 rounded-xl px-4 py-3 text-xs text-[#534AB7] leading-relaxed">
              <strong>Verde (Activar):</strong> encaje cultural alto con tu marca — recomendamos usarlas.{' '}
              <strong>Amarillo (Por evaluar):</strong> encaje moderado — queda a tu criterio si las incluyes en tu campaña.
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-12">Cargando tendencias...</div>
          ) : lista.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12">No hay tendencias con ese filtro.</div>
          ) : (
            <div className="space-y-2">
              {lista.map(({ tendencia, score }) => {
                const estado = score ? getScoreEstado(score.score_final) : null
                return (
                  <button
                    key={tendencia.id}
                    onClick={() => navigate(`/tendencia/${tendencia.id}`)}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-[#534AB7]/30 hover:shadow-sm transition text-left group"
                  >
                    {/* Score */}
                    <div className="w-14 shrink-0 text-center">
                      {score ? (
                        <>
                          <span className={`text-lg font-bold ${
                            estado.color === 'green' ? 'text-green-600' :
                            estado.color === 'yellow' ? 'text-yellow-600' : 'text-red-500'
                          }`}>{score.score_final}</span>
                          <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${scoreBar[estado.color]}`}
                              style={{ width: `${score.score_final}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium">—</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#534AB7] transition">
                          {tendencia.nombre}
                        </span>
                        {estado && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${estadoBadge[estado.color]}`}>
                            {estado.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {tendencia.fuente} · {tendencia.categoria} · {tendencia.fecha ?? tendencia.creada_at?.slice(0, 10)}
                      </p>
                    </div>

                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#534AB7] transition shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
