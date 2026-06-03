import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import { getMarca, updateVozMarca, updatePerfilMarca } from '../lib/api'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Mail, Building2, ShieldCheck, LogOut, Mic2, Save, CheckCircle, ChevronDown, Target } from 'lucide-react'

const PLAN_INFO = {
  basico:    { label: 'Básico',    color: 'bg-gray-100 text-gray-600' },
  pro:       { label: 'Pro',       color: 'bg-blue-100 text-blue-700' },
  enterprise:{ label: 'Enterprise',color: 'bg-[#534AB7]/10 text-[#534AB7]' },
  señal:     { label: 'Señal',     color: 'bg-violet-100 text-violet-700' },
}

const PLATAFORMAS = ['TikTok', 'Instagram', 'Facebook', 'YouTube', 'LinkedIn']
const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Antojo nocturno', 'Delivery', 'Reunión familiar', 'Ocasión especial']

const perfilVacio = {
  publico:    '',
  territorio: '',
  tono:       '',
  palanca:    '',
}

function perfilCompleteness(p) {
  const llenos = [p.publico, p.territorio, p.tono, p.palanca].filter(Boolean).length
  return Math.round((llenos / 4) * 100)
}

const vozVacia = {
  personalidad: '',
  estilo_escritura: '',
  nivel_humor: '',
  usa_emojis: null,
  plataformas_activas: [],
  pilares_contenido: '',
  temas_prohibidos: '',
  audiencia_nsea: '',
  momento_consumo: [],
}

function completeness(voz) {
  const campos = [
    voz.personalidad,
    voz.estilo_escritura,
    voz.nivel_humor,
    voz.usa_emojis !== null,
    voz.plataformas_activas?.length > 0,
    voz.pilares_contenido,
    voz.temas_prohibidos,
    voz.audiencia_nsea,
    voz.momento_consumo?.length > 0,
  ]
  const llenos = campos.filter(Boolean).length
  return Math.round((llenos / campos.length) * 100)
}

function SelectField({ label, hint, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40"
        >
          <option value="">Selecciona una opción</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function CheckGroup({ label, hint, options, value, onChange }) {
  function toggle(item) {
    onChange(value.includes(item) ? value.filter(x => x !== item) : [...value, item])
  }
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="flex flex-wrap gap-2 pt-0.5">
        {options.map(opt => {
          const active = value.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                active
                  ? 'bg-[#534AB7] text-white border-[#534AB7]'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#534AB7]/40 hover:text-[#534AB7]'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ToggleField({ label, hint, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="flex gap-2 pt-0.5">
        {[{ val: true, label: 'Sí' }, { val: false, label: 'No' }].map(({ val, label: lbl }) => (
          <button
            key={String(val)}
            type="button"
            onClick={() => onChange(val)}
            className={`text-xs px-4 py-1.5 rounded-full border font-medium transition ${
              value === val
                ? 'bg-[#534AB7] text-white border-[#534AB7]'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#534AB7]/40'
            }`}
          >
            {lbl}
          </button>
        ))}
        {value === null && (
          <span className="text-xs text-gray-300 self-center">Sin definir</span>
        )}
      </div>
    </div>
  )
}

export default function Ajustes() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState(perfilVacio)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [guardadoPerfilOk, setGuardadoPerfilOk] = useState(false)

  const [voz, setVoz] = useState(vozVacia)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)
  const [loadingVoz, setLoadingVoz] = useState(false)

  const plan = PLAN_INFO[user?.plan] ?? PLAN_INFO.basico
  const tieneMarca = !!user?.marca_id

  useEffect(() => {
    if (!tieneMarca) return
    setLoadingVoz(true)
    getMarca(user.marca_id)
      .then(m => {
        // Perfil base
        setPerfil({
          publico:    m.publico    || '',
          territorio: m.territorio || '',
          tono:       m.tono       || '',
          palanca:    m.palanca    || '',
        })
        // Voz de marca digital
        const v = m.voz_marca || {}
        setVoz({
          personalidad:      v.personalidad      || '',
          estilo_escritura:  v.estilo_escritura  || '',
          nivel_humor:       v.nivel_humor       || '',
          usa_emojis:        v.usa_emojis        ?? null,
          plataformas_activas: v.plataformas_activas || [],
          pilares_contenido:   (v.pilares_contenido || []).join(', '),
          temas_prohibidos:    (v.temas_prohibidos  || []).join(', '),
          audiencia_nsea:    v.audiencia_nsea    || '',
          momento_consumo:   v.momento_consumo   || [],
        })
      })
      .catch(() => {})
      .finally(() => setLoadingVoz(false))
  }, [user?.marca_id, tieneMarca])

  function setPerfilField(key, val) {
    setPerfil(prev => ({ ...prev, [key]: val }))
    setGuardadoPerfilOk(false)
  }

  async function handleGuardarPerfil() {
    setGuardandoPerfil(true)
    setGuardadoPerfilOk(false)
    try {
      await updatePerfilMarca(user.marca_id, perfil)
      setGuardadoPerfilOk(true)
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setGuardandoPerfil(false)
    }
  }

  function setVozField(key, val) {
    setVoz(prev => ({ ...prev, [key]: val }))
    setGuardadoOk(false)
  }

  async function handleGuardar() {
    setGuardando(true)
    setGuardadoOk(false)
    try {
      const payload = {
        ...voz,
        pilares_contenido: voz.pilares_contenido
          ? voz.pilares_contenido.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        temas_prohibidos: voz.temas_prohibidos
          ? voz.temas_prohibidos.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      }
      await updateVozMarca(user.marca_id, payload)
      setGuardadoOk(true)
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  function handleLogout() {
    setUser(null)
    navigate('/login')
  }

  const pct = completeness(voz)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-2xl space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-900">Ajustes</h1>
            <p className="text-sm text-gray-400 mt-0.5">Información de tu cuenta y perfil de marca</p>
          </div>

          {/* Perfil de cuenta */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-700">Perfil</h2>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-xl font-bold">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.nombre ?? user?.email}</p>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${plan.color}`}>
                  Plan {plan.label}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                <ShieldCheck size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Rol</p>
                  <p className="text-sm font-medium text-gray-700 capitalize">{user?.rol}</p>
                </div>
              </div>
              {user?.marca_nombre && (
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <Building2 size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Marca</p>
                    <p className="text-sm font-medium text-gray-700">{user.marca_nombre}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Perfil de tu marca — solo si el usuario tiene marca */}
          {tieneMarca && (() => {
            const pct = perfilCompleteness(perfil)
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-[#534AB7]" />
                      <h2 className="text-sm font-semibold text-gray-700">Perfil de tu marca</h2>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      pct === 100 ? 'bg-green-100 text-green-700' :
                      pct >= 50   ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-50 text-red-500'
                    }`}>
                      {pct}% completado
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Esta información define el ADN estratégico de tu marca. La IA la usa para calcular el score de cada tendencia.
                  </p>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Público objetivo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">¿A quién le vendes?</label>
                    <p className="text-xs text-gray-400">Tu público objetivo: edad, estilo de vida, qué los mueve.</p>
                    <textarea
                      value={perfil.publico}
                      onChange={e => setPerfilField('publico', e.target.value)}
                      rows={2}
                      placeholder='Ej: "Jóvenes de 18-35 años, NSE C/D, que buscan una comida rica y accesible para el día a día."'
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  {/* Territorio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">¿En qué territorio cultural opera tu marca?</label>
                    <p className="text-xs text-gray-400">No es solo geografía — es el espacio cultural que tu marca ocupa en la vida de las personas.</p>
                    <input
                      type="text"
                      value={perfil.territorio}
                      onChange={e => setPerfilField('territorio', e.target.value)}
                      placeholder='Ej: "Lo cotidiano peruano — la comida del día a día, sin pretensiones, auténtica."'
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  {/* Tono */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">¿Cuál es el tono principal de tu marca?</label>
                    <p className="text-xs text-gray-400">La actitud general con la que tu marca se presenta al mundo.</p>
                    <input
                      type="text"
                      value={perfil.tono}
                      onChange={e => setPerfilField('tono', e.target.value)}
                      placeholder='Ej: "Cercano, jovial, sin complicaciones. Como un amigo que te recomienda dónde comer."'
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  {/* Palanca */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">¿Cuál es tu principal diferenciador?</label>
                    <p className="text-xs text-gray-400">La razón por la que tus clientes te eligen sobre la competencia.</p>
                    <input
                      type="text"
                      value={perfil.palanca}
                      onChange={e => setPerfilField('palanca', e.target.value)}
                      placeholder='Ej: "Precio accesible con sabor casero — la mejor relación calidad/precio del barrio."'
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleGuardarPerfil}
                      disabled={guardandoPerfil}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] text-white text-sm font-semibold rounded-xl hover:bg-[#453da0] transition disabled:opacity-60"
                    >
                      <Save size={15} />
                      {guardandoPerfil ? 'Guardando...' : 'Guardar perfil'}
                    </button>
                    {guardadoPerfilOk && (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle size={15} /> Guardado correctamente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Voz de Marca — solo si el usuario tiene marca */}
          {tieneMarca && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header con barra de completeness */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Mic2 size={16} className="text-[#534AB7]" />
                    <h2 className="text-sm font-semibold text-gray-700">Voz de Marca Digital</h2>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pct >= 80 ? 'bg-green-100 text-green-700' :
                    pct >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {pct}% completado
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Cuéntanos cómo se expresa tu marca en redes sociales. Esto mejora la precisión del scoring y los briefs generados por la IA.
                </p>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 80 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>

              {loadingVoz ? (
                <div className="p-8 text-center text-gray-400 text-sm">Cargando perfil de voz...</div>
              ) : (
                <div className="p-6 space-y-6">

                  {/* Personalidad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Personalidad de la marca</label>
                    <p className="text-xs text-gray-400">Descríbela en una oración como si fuera una persona. ¿Quién es tu marca?</p>
                    <textarea
                      value={voz.personalidad}
                      onChange={e => setVozField('personalidad', e.target.value)}
                      rows={2}
                      placeholder='Ej: "El amigo peruano de siempre, que te da una buena comida sin complicaciones y siempre tiene un chiste a la mano."'
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField
                      label="Estilo de escritura"
                      hint="¿Cómo escriben los posts y captions?"
                      value={voz.estilo_escritura}
                      onChange={v => setVozField('estilo_escritura', v)}
                      options={[
                        { value: 'informal', label: 'Informal y cercano' },
                        { value: 'formal', label: 'Formal y cuidado' },
                        { value: 'mixto', label: 'Mixto según contexto' },
                      ]}
                    />
                    <SelectField
                      label="Nivel de humor"
                      hint="¿Qué tan presente está el humor en su contenido?"
                      value={voz.nivel_humor}
                      onChange={v => setVozField('nivel_humor', v)}
                      options={[
                        { value: 'ninguno', label: 'No usamos humor' },
                        { value: 'sutil', label: 'Sutil y ocasional' },
                        { value: 'frecuente', label: 'Frecuente' },
                        { value: 'es_su_sello', label: 'Es nuestro sello' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <ToggleField
                      label="¿Usan emojis?"
                      hint="En captions, stories y comentarios"
                      value={voz.usa_emojis}
                      onChange={v => setVozField('usa_emojis', v)}
                    />
                    <SelectField
                      label="NSE objetivo"
                      hint="Nivel socioeconómico de tu audiencia principal"
                      value={voz.audiencia_nsea}
                      onChange={v => setVozField('audiencia_nsea', v)}
                      options={[
                        { value: 'A', label: 'NSE A (alto)' },
                        { value: 'B', label: 'NSE B (medio-alto)' },
                        { value: 'B/C', label: 'NSE B/C (medio)' },
                        { value: 'C', label: 'NSE C (medio-bajo)' },
                        { value: 'C/D', label: 'NSE C/D' },
                        { value: 'D', label: 'NSE D (popular)' },
                        { value: 'Todos', label: 'Todos los niveles' },
                      ]}
                    />
                  </div>

                  <CheckGroup
                    label="Plataformas activas"
                    hint="¿Dónde publican contenido regularmente?"
                    options={PLATAFORMAS}
                    value={voz.plataformas_activas}
                    onChange={v => setVozField('plataformas_activas', v)}
                  />

                  <CheckGroup
                    label="Momentos clave de consumo"
                    hint="¿En qué momentos del día/semana te consume tu audiencia?"
                    options={MOMENTOS}
                    value={voz.momento_consumo}
                    onChange={v => setVozField('momento_consumo', v)}
                  />

                  {/* Pilares de contenido */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Pilares de contenido</label>
                    <p className="text-xs text-gray-400">Los 3-5 temas que trabajan siempre. Separa con comas.</p>
                    <input
                      type="text"
                      value={voz.pilares_contenido}
                      onChange={e => setVozField('pilares_contenido', e.target.value)}
                      placeholder="Ej: precio accesible, sabor peruano, momentos en familia, antojo del día"
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  {/* Temas prohibidos */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Temas que nunca tocamos</label>
                    <p className="text-xs text-gray-400">Lo que tu marca NUNCA haría en redes. Separa con comas.</p>
                    <input
                      type="text"
                      value={voz.temas_prohibidos}
                      onChange={e => setVozField('temas_prohibidos', e.target.value)}
                      placeholder="Ej: política, religión, contenido gourmet élite, críticas a competidores"
                      className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]/40 placeholder:text-gray-300"
                    />
                  </div>

                  {/* Botón guardar */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleGuardar}
                      disabled={guardando}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] text-white text-sm font-semibold rounded-xl hover:bg-[#453da0] transition disabled:opacity-60"
                    >
                      <Save size={15} />
                      {guardando ? 'Guardando...' : 'Guardar voz de marca'}
                    </button>
                    {guardadoOk && (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle size={15} /> Guardado correctamente
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sesión */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Sesión</h2>
            <p className="text-xs text-gray-400">
              Al cerrar sesión perderás el acceso hasta que vuelvas a iniciar.
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}
