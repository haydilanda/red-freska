export default function ScoreGauge({ score, size = 'lg' }) {
  const radius = size === 'lg' ? 54 : 36
  const stroke = size === 'lg' ? 8 : 6
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const dim = (radius + stroke) * 2

  const color =
    score >= 65 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={dim}
        height={dim}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={`font-bold leading-none ${size === 'lg' ? 'text-4xl' : 'text-xl'}`}
          style={{ color }}
        >
          {score}
        </span>
        {size === 'lg' && (
          <span className="text-xs text-gray-400 mt-1">/ 100</span>
        )}
      </div>
    </div>
  )
}
