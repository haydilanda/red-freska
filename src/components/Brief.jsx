// Mapa de plataformas → emoji + color de fondo
const PLATAFORMAS = {
  'tiktok':           { emoji: '🎵', bg: '#ff005015', text: '#cc0040' },
  'instagram reels':  { emoji: '🎬', bg: '#833ab415', text: '#6b2d9a' },
  'instagram':        { emoji: '📸', bg: '#e1306c15', text: '#b82459' },
  'reels':            { emoji: '🎬', bg: '#833ab415', text: '#6b2d9a' },
  'stories':          { emoji: '📱', bg: '#f7773715', text: '#c45e1a' },
  'facebook':         { emoji: '👥', bg: '#1877f215', text: '#0f5ab5' },
  'youtube shorts':   { emoji: '▶️', bg: '#ff000015', text: '#cc0000' },
  'youtube':          { emoji: '▶️', bg: '#ff000015', text: '#cc0000' },
  'memes':            { emoji: '😄', bg: '#f59e0b15', text: '#b45309' },
  'whatsapp':         { emoji: '💬', bg: '#25d36615', text: '#15803d' },
  'twitter/x':        { emoji: '🐦', bg: '#1da1f215', text: '#0e86cc' },
  'twitter':          { emoji: '🐦', bg: '#1da1f215', text: '#0e86cc' },
}

function getPlatformStyle(nombre) {
  const key = (nombre || '').toLowerCase()
  for (const [k, v] of Object.entries(PLATAFORMAS)) {
    if (key.includes(k)) return v
  }
  return { emoji: '✨', bg: '#534AB715', text: '#534AB7' }
}

// Normaliza el brief al formato nuevo — compatibilidad con briefs legacy (string)
function normalizarBrief(brief) {
  if (!brief) return null

  const angulo = typeof brief.angulo === 'string'
    ? { titular: brief.angulo.split('.')[0], descripcion: brief.angulo }
    : brief.angulo

  const formato = Array.isArray(brief.formato)
    ? brief.formato
    : typeof brief.formato === 'string'
      ? brief.formato.split(/[;,\n]/).map(s => s.trim()).filter(Boolean).map(s => ({
          plataforma: s.split(':')[0]?.trim() || s,
          tipo: s.split(':')[1]?.trim() || '',
        }))
      : []

  const cta = typeof brief.cta === 'string'
    ? { titulo: brief.cta.split('.')[0], descripcion: brief.cta, pasos: [] }
    : brief.cta

  return { angulo, formato, cta }
}

export default function Brief({ brief }) {
  const data = normalizarBrief(brief)
  if (!data) return null

  const { angulo, formato, cta } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* ── 01 Ángulo ── */}
      <div className="relative bg-gradient-to-br from-[#534AB7] to-[#3a3290] rounded-2xl p-6 text-white overflow-hidden flex flex-col">
        {/* Número decorativo de fondo */}
        <span className="absolute -top-4 -right-2 text-[100px] font-black text-white/5 select-none leading-none">
          01
        </span>

        <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center mb-4 shrink-0">
          <span className="text-xs font-bold text-white/70">01</span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
          Ángulo sugerido
        </p>

        <h3 className="text-xl font-bold leading-tight mb-3 flex-1">
          {angulo?.titular || '—'}
        </h3>

        <p className="text-sm text-white/75 leading-relaxed">
          {angulo?.descripcion || ''}
        </p>
      </div>

      {/* ── 02 Formato ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mb-4 shrink-0">
          <span className="text-xs font-bold text-gray-400">02</span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
          Formato recomendado
        </p>

        <div className="space-y-2.5 flex-1">
          {(formato || []).map((f, i) => {
            const style = getPlatformStyle(f.plataforma)
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-100"
                style={{ backgroundColor: style.bg }}
              >
                <span className="text-xl leading-none shrink-0">{style.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight truncate" style={{ color: style.text }}>
                    {f.plataforma}
                  </p>
                  {f.tipo && (
                    <p className="text-xs text-gray-400 truncate">{f.tipo}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 03 CTA ── */}
      <div className="bg-green-50 rounded-2xl border border-green-100 p-6 flex flex-col">
        <div className="w-8 h-8 rounded-full border border-green-200 flex items-center justify-center mb-4 shrink-0">
          <span className="text-xs font-bold text-green-600">03</span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-3">
          Call to action
        </p>

        <h3 className="text-lg font-bold text-green-900 leading-tight mb-2">
          {cta?.titulo || '—'}
        </h3>

        {cta?.descripcion && (
          <p className="text-sm text-green-700 leading-relaxed mb-4">
            {cta.descripcion}
          </p>
        )}

        {(cta?.pasos?.length > 0) && (
          <div className="space-y-2 mt-auto">
            {cta.pasos.map((paso, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-green-600">{i + 1}</span>
                </div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-tight">
                  {paso}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
