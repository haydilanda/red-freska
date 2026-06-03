import { useAuth } from '../App'
import { MARCAS } from '../lib/mockData'
import { Bell } from 'lucide-react'

export default function Topbar() {
  const { user } = useAuth()
  const marca = user?.marca_id ? MARCAS[user.marca_id] : null

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'RF'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div>
        {marca ? (
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: marca.color }}
            />
            <span className="font-semibold text-gray-800 text-sm">{marca.nombre}</span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-xs text-gray-400">Dashboard de tendencias</span>
          </div>
        ) : (
          <span className="font-semibold text-gray-800 text-sm">Panel de Administración</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
