import { useNavigate } from 'react-router-dom'
import { getScoreEstado } from '../lib/mockData'
import { ChevronRight } from 'lucide-react'

const estadoStyles = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-600',
}

const barColor = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
}

export default function TendenciaRow({ tendencia, score }) {
  const navigate = useNavigate()
  const estado = getScoreEstado(score.score_final)

  return (
    <div
      onClick={() => navigate(`/tendencia/${tendencia.id}`)}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition group"
    >
      {/* Score bar */}
      <div className="flex flex-col items-center w-14 shrink-0">
        <span className="text-lg font-bold text-gray-800">{score.score_final}</span>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
          <div
            className={`h-1.5 rounded-full ${barColor[estado.color]}`}
            style={{ width: `${score.score_final}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{tendencia.nombre}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {tendencia.fuente} · {tendencia.categoria}
        </p>
      </div>

      {/* Estado badge */}
      <span
        className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${estadoStyles[estado.color]}`}
      >
        {estado.label}
      </span>

      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition shrink-0" />
    </div>
  )
}
