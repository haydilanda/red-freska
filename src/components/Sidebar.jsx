import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react'
import logo from '../assets/logo.png'

const clienteLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tendencias',  icon: TrendingUp,       label: 'Tendencias' },
  { to: '/ajustes',     icon: Settings,         label: 'Ajustes' },
]

const adminLinks = [
  { to: '/admin',     icon: ShieldCheck,  label: 'Panel Admin' },
  { to: '/clientes',  icon: Users,        label: 'Clientes' },
  { to: '/ajustes',   icon: Settings,     label: 'Config' },
]

export default function Sidebar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const links = user?.rol === 'admin' ? adminLinks : clienteLinks

  function handleLogout() {
    setUser(null)
    navigate('/login')
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <img src={logo} alt="Red Freska" className="h-10 w-auto rounded-lg object-cover" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#534AB7]/10 text-[#534AB7]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors w-full"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
