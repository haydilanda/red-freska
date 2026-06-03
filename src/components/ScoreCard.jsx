export default function ScoreCard({ label, value, sub, icon: Icon, color = '#534AB7' }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>
    </div>
  )
}
