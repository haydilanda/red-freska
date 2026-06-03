import { useState, useEffect } from 'react'
import { getMarcas, getScores, activarMarca, updatePerfilMarca } from '../lib/api'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import {
  Users, CheckCircle2, AlertCircle, XCircle,
  TrendingUp, Target, Mic2, Info, Clock, CheckCheck, Pencil, X, Save,
} from 'lucide-react'

// Color por índice — funciona para cualquier cantidad de marcas
const PALETTE = ['#534AB7', '#ef4444', '#22c55e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6']

const ESTILO_LABEL = { formal: 'Formal y cuidado', informal: 'Informal y cercano', mixto: 'Mixto según contexto' }
const HUMOR_LABEL  = { ninguno: 'No usa humor', sutil: 'Sutil y ocasional', frecuente: 'Frecuente', es_su_sello: 'Es su sello ✦' }
const PLAN_BADGE   = {
  señal:     'bg-violet-100 text-violet-700',
  basico:    'bg-gray-100 text-gray-600',
  pro:       'bg-blue-100 text-blue-700',
  enterprise:'bg-[#534AB7]/10 text-[#534AB7]',
}

function vozCompleteness(voz) {
  if (!voz) return 0
  const checks = [
    !!voz.personalidad,
    !!voz.estilo_escritura,
    !!voz.nivel_humor,
    voz.usa_emojis !== null && voz.usa_emojis !== undefined,
    (voz.plataformas_activas?.length ?? 0) > 0,
    (voz.pilares_contenido?.length ?? 0) > 0,
    (voz.temas_prohibidos?.length ?? 0) > 0,
    !!voz.audiencia_nsea,
    (voz.momento_consumo?.length ?? 0) > 0,
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

function CompletenessBar({ pct }) {
  const color = pct >= 80 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  )
}

function Chip({ children, color = 'gray' }) {
  const styles = {
    gray:   'bg-gray-100 text-gray-600',
    purple: 'bg-[#534AB7]/10 text-[#534AB7]',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red:    'bg-red-100 text-red-600',
  }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${styles[color]}`}>
      {children}
    </span>
  )
}

function StatBox({ value, label, sub }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-0.5">
      <span className="text-2xl font-bold text-gray-800 tabular-nums">{value ?? '—'}</span>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

function PerfilRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-700 leading-relaxed">{value}</span>
    </div>
  )
}

function VozField({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  )
}

function perfilBaseCompleteness(m) {
  return [m.publico, m.territorio, m.tono, m.palanca].filter(Boolean).length
}

function DetallePanel({ marca, scores, color, onPerfilUpdate }) {
  const voz = marca.voz_marca || null
  const pct = vozCompleteness(voz)

  const [editando, setEditando] = useState(false)
  const [perfilEdit, setPerfilEdit] = useState({
    publico:    marca.publico    || '',
    territorio: marca.territorio || '',
    tono:       marca.tono       || '',
    palanca:    marca.palanca    || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  const marcaScores = scores.filter(s => s.marca_id === marca.id)
  const totalScoradas = marcaScores.length
  const promedio = totalScoradas
    ? (marcaScores.reduce((a, s) => a + s.score_final, 0) / totalScoradas).toFixed(1)
    : null
  const activables = marcaScores.filter(s => s.score_final >= 65).length

  const planClass = PLAN_BADGE[marca.plan] ?? PLAN_BADGE.basico
  const planLabel = (marca.plan ?? 'señal').charAt(0).toUpperCase() + (marca.plan ?? 'señal').slice(1)
  const perfilLlenos = perfilBaseCompleteness(marca)

  async function handleGuardarPerfil() {
    setGuardando(true)
    try {
      await updatePerfilMarca(marca.id, perfilEdit)
      onPerfilUpdate(marca.id, perfilEdit)
      setGuardadoOk(true)
      setTimeout(() => { setGuardadoOk(false); setEditando(false) }, 1200)
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  function cancelarEdicion() {
    setPerfilEdit({
      publico:    marca.publico    || '',
      territorio: marca.territorio || '',
      tono:       marca.tono       || '',
      palanca:    marca.palanca    || '',
    })
    setEditando(false)
  }

  const inputCls = 'w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300'

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header marca */}
      <div className="px-8 py-7 border-b border-gray-100 flex items-start gap-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          {marca.nombre[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900">{marca.nombre}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planClass}`}>
              Plan {planLabel}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              marca.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${marca.activa ? 'bg-green-500' : 'bg-gray-400'}`} />
              {marca.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          {voz?.personalidad && (
            <p className="text-sm text-gray-500 mt-1.5 italic leading-relaxed">"{voz.personalidad}"</p>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">

        {/* Rendimiento */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-gray-400" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rendimiento</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox value={totalScoradas} label="Tendencias scoradas" sub="en base de datos" />
            <StatBox value={promedio} label="Score promedio" sub="cultural fit" />
            <StatBox value={activables} label="Activables" sub="score ≥ 65" />
          </div>
        </section>

        {/* Perfil base */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil Base</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                perfilLlenos === 4 ? 'bg-green-100 text-green-700' :
                perfilLlenos >= 2 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-50 text-red-500'
              }`}>
                {perfilLlenos}/4 campos
              </span>
            </div>
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-1.5 text-xs text-[#534AB7] font-semibold hover:underline"
              >
                <Pencil size={12} /> Editar
              </button>
            ) : (
              <button
                onClick={cancelarEdicion}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
              >
                <X size={12} /> Cancelar
              </button>
            )}
          </div>

          {editando ? (
            <div className="bg-white rounded-2xl border border-[#534AB7]/20 p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Público objetivo</label>
                <textarea value={perfilEdit.publico} onChange={e => setPerfilEdit(p => ({ ...p, publico: e.target.value }))} rows={2} placeholder="Ej: Jóvenes 18-35, NSE C/D, amantes de la comida rápida…" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Territorio cultural</label>
                <input type="text" value={perfilEdit.territorio} onChange={e => setPerfilEdit(p => ({ ...p, territorio: e.target.value }))} placeholder="Ej: Lo cotidiano peruano, sin pretensiones…" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Tono de marca</label>
                <input type="text" value={perfilEdit.tono} onChange={e => setPerfilEdit(p => ({ ...p, tono: e.target.value }))} placeholder="Ej: Cercano, jovial, directo…" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Palanca / diferenciador</label>
                <input type="text" value={perfilEdit.palanca} onChange={e => setPerfilEdit(p => ({ ...p, palanca: e.target.value }))} placeholder="Ej: Mejor relación calidad/precio del barrio…" className={inputCls} />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleGuardarPerfil}
                  disabled={guardando}
                  className="flex items-center gap-2 px-4 py-2 bg-[#534AB7] text-white text-xs font-semibold rounded-xl hover:bg-[#453da0] transition disabled:opacity-60"
                >
                  <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
                {guardadoOk && (
                  <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                    <CheckCircle2 size={13} /> Guardado
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 divide-y divide-gray-50">
              <PerfilRow label="Público" value={marca.publico} />
              <PerfilRow label="Territorio" value={marca.territorio} />
              <PerfilRow label="Tono" value={marca.tono} />
              <PerfilRow label="Palanca" value={marca.palanca} />
              {perfilLlenos === 0 && (
                <div className="py-4 text-xs text-amber-600 flex items-center gap-2">
                  <Info size={14} className="text-amber-400 shrink-0" />
                  Perfil base vacío — haz clic en <span className="font-semibold">Editar</span> para completarlo o pídele al cliente que lo llene en Ajustes.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Voz de Marca Digital */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic2 size={14} className="text-[#534AB7]" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Voz de Marca Digital</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              pct >= 80 ? 'bg-green-100 text-green-700' :
              pct >= 40 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-50 text-red-500'
            }`}>
              {pct}% completado
            </span>
          </div>

          <div className="mb-4">
            <CompletenessBar pct={pct} />
          </div>

          {voz && (Object.values(voz).some(v => v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))) ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 divide-y divide-gray-50">
              <VozField label="Estilo" value={ESTILO_LABEL[voz.estilo_escritura] ?? voz.estilo_escritura} />
              <VozField label="Humor" value={HUMOR_LABEL[voz.nivel_humor] ?? voz.nivel_humor} />
              {voz.usa_emojis !== null && voz.usa_emojis !== undefined && (
                <VozField label="Emojis" value={voz.usa_emojis ? 'Sí los usa' : 'No usa emojis'} />
              )}
              <VozField label="NSE objetivo" value={voz.audiencia_nsea} />
              {voz.plataformas_activas?.length > 0 && (
                <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 w-28 shrink-0 pt-0.5">Plataformas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {voz.plataformas_activas.map(p => (
                      <Chip key={p} color="purple">{p}</Chip>
                    ))}
                  </div>
                </div>
              )}
              {voz.momento_consumo?.length > 0 && (
                <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 w-28 shrink-0 pt-0.5">Momentos</span>
                  <div className="flex flex-wrap gap-1.5">
                    {voz.momento_consumo.map(m => (
                      <Chip key={m} color="gray">{m}</Chip>
                    ))}
                  </div>
                </div>
              )}
              {voz.pilares_contenido?.length > 0 && (
                <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 w-28 shrink-0 pt-0.5">Pilares</span>
                  <div className="flex flex-wrap gap-1.5">
                    {voz.pilares_contenido.map(p => (
                      <Chip key={p} color="green">{p}</Chip>
                    ))}
                  </div>
                </div>
              )}
              {voz.temas_prohibidos?.length > 0 && (
                <div className="flex gap-3 py-2.5 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 w-28 shrink-0 pt-0.5">Evita</span>
                  <div className="flex flex-wrap gap-1.5">
                    {voz.temas_prohibidos.map(t => (
                      <Chip key={t} color="red">{t}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700">Perfil de voz sin configurar</p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                  Esta marca aún no ha completado su voz de marca digital. Pídele al cliente que vaya a{' '}
                  <span className="font-semibold">Ajustes → Voz de Marca Digital</span> para configurarla.
                  Esto mejora significativamente la precisión del scoring y los briefs generados.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function Clientes() {
  const [marcas, setMarcas] = useState([])
  const [scores, setScores] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activando, setActivando] = useState(null) // marca_id en proceso

  useEffect(() => {
    async function cargar() {
      try {
        const [mrcs, scs] = await Promise.all([getMarcas(), getScores()])
        setMarcas(mrcs)
        setScores(scs)
        // Seleccionar primera marca activa por defecto
        const primeraActiva = mrcs.find(m => m.activa)
        if (primeraActiva) setSeleccionada(primeraActiva.id)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  async function handleActivar(marcaId) {
    setActivando(marcaId)
    try {
      await activarMarca(marcaId)
      setMarcas(prev => prev.map(m => m.id === marcaId ? { ...m, activa: true } : m))
      setSeleccionada(marcaId)
    } catch (e) {
      alert('Error al activar: ' + e.message)
    } finally {
      setActivando(null)
    }
  }

  const activas    = marcas.filter(m => m.activa)
  const pendientes = marcas.filter(m => !m.activa)
  const marcaActiva = marcas.find(m => m.id === seleccionada)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Cargando clientes...
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">

            {/* ── Panel izquierdo: lista de marcas ── */}
            <div className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
              <div className="px-5 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#534AB7]" />
                    <h1 className="text-sm font-bold text-gray-800">Cartera de clientes</h1>
                  </div>
                  <span className="text-xs font-bold bg-[#534AB7]/10 text-[#534AB7] px-2 py-0.5 rounded-full">
                    {marcas.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">

                {/* Pendientes de activación */}
                {pendientes.length > 0 && (
                  <div>
                    <div className="px-4 pt-4 pb-1.5 flex items-center gap-2">
                      <Clock size={11} className="text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                        Pendientes ({pendientes.length})
                      </span>
                    </div>
                    {pendientes.map((m) => (
                      <div key={m.id} className="px-4 py-3 border-b border-amber-50 bg-amber-50/50">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
                            {m.nombre[0]}
                          </div>
                          <p className="text-sm font-semibold text-gray-700 truncate flex-1">{m.nombre}</p>
                        </div>
                        <button
                          onClick={() => handleActivar(m.id)}
                          disabled={activando === m.id}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#534AB7] text-white text-xs font-semibold rounded-lg hover:bg-[#453da0] transition disabled:opacity-60"
                        >
                          <CheckCheck size={12} />
                          {activando === m.id ? 'Activando...' : 'Activar cuenta'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clientes activos */}
                {activas.length > 0 && (
                  <div>
                    {pendientes.length > 0 && (
                      <div className="px-4 pt-4 pb-1.5 flex items-center gap-2">
                        <CheckCircle2 size={11} className="text-green-500" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                          Activos ({activas.length})
                        </span>
                      </div>
                    )}
                    {activas.map((m) => {
                      const idx = marcas.findIndex(x => x.id === m.id)
                      const color = PALETTE[idx % PALETTE.length]
                      const pct = vozCompleteness(m.voz_marca)
                      const active = seleccionada === m.id
                      const pctColor = pct >= 80 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'
                      const PctIcon = pct >= 80 ? CheckCircle2 : pct >= 40 ? AlertCircle : XCircle

                      return (
                        <button
                          key={m.id}
                          onClick={() => setSeleccionada(m.id)}
                          className={`relative w-full text-left px-4 py-3.5 flex items-center gap-3 transition ${
                            active ? 'bg-[#534AB7]/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r transition-all ${active ? 'opacity-100' : 'opacity-0'}`}
                            style={{ backgroundColor: '#534AB7' }}
                          />
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {m.nombre[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${active ? 'text-[#534AB7]' : 'text-gray-700'}`}>
                              {m.nombre}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <PctIcon size={11} style={{ color: pctColor }} />
                              <span className="text-xs" style={{ color: pctColor }}>
                                {pct}% voz configurada
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {marcas.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-400 text-xs">
                    No hay clientes registrados.
                  </div>
                )}
              </div>
            </div>

            {/* ── Panel derecho: detalle ── */}
            {marcaActiva ? (
              <DetallePanel
                key={marcaActiva.id}
                marca={marcaActiva}
                scores={scores}
                color={PALETTE[marcas.findIndex(m => m.id === marcaActiva.id) % PALETTE.length]}
                onPerfilUpdate={(id, campos) =>
                  setMarcas(prev => prev.map(m => m.id === id ? { ...m, ...campos } : m))
                }
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
                Selecciona un cliente
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
