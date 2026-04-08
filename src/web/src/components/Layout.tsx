import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, BarChart3, LogOut, Sun, Moon, Menu, X, Settings, ChevronLeft, ChevronRight, User, ArrowLeftRight, Repeat, Target, Wallet, Trophy, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Dashboard', end: true },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transações', end: false },
  { to: '/recurring', icon: Repeat, label: 'Lançamentos Fixos', end: false },
  { to: '/budgets', icon: Target, label: 'Orçamentos', end: false },
  { to: '/accounts', icon: Wallet, label: 'Contas', end: false },
  { to: '/goals', icon: Trophy, label: 'Metas', end: false },
  { to: '/calendar', icon: Calendar, label: 'Calendário', end: false },
  { to: '/reports', icon: BarChart3, label: 'Relatórios', end: false },
  { to: '/settings', icon: Settings, label: 'Configurações', end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popoverOpen])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <img src="/icon.png" alt="Controller" className="h-7 object-contain" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-[#0A0A0C] border-r border-gray-200 dark:border-white/5 z-40 flex flex-col transition-all duration-300 ease-in-out overflow-visible
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} lg:translate-x-0`}
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (collapsed ? '72px' : '256px') : undefined }}
      >
        {/* Logo + Collapse toggle */}
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center px-0' : 'px-5'} gap-3 relative`}>
          {collapsed ? (
            <div className="hidden lg:flex w-11 h-11 rounded-xl overflow-hidden">
              <img src="/icon.png" alt="C" className="h-11 w-auto object-cover object-left scale-150 origin-left" />
            </div>
          ) : (
            <img src="/icon.png" alt="Controller" className="h-12 object-contain" />
          )}
          <img src="/icon.png" alt="Controller" className="h-10 object-contain lg:hidden" />

          {/* Collapse button - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 rounded-full items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm z-10"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Nav label */}
        {!collapsed && (
          <div className="px-3 py-2 mt-2">
            <p className="px-3 py-1 text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Plataforma</p>
          </div>
        )}
        {collapsed && <div className="mt-4 hidden lg:block" />}

        {/* Nav */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} space-y-1`}>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-all group border
                ${collapsed ? 'justify-center px-0 lg:justify-center' : 'px-3'}
                ${isActive
                  ? 'text-emerald-600 dark:text-white bg-emerald-50 dark:bg-white/5 border-emerald-100 dark:border-white/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="hidden lg:inline">{label}</span>}
              <span className="lg:hidden">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section - user */}
        <div className="p-2 border-t border-gray-200 dark:border-white/5 relative overflow-visible" ref={popoverRef}>
          {/* Popover */}
          {popoverOpen && (
            <div className="absolute bottom-full left-2 mb-2 w-56 bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
              {user && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.nome}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{user.email}</p>
                </div>
              )}
              <div className="py-1">
                <button onClick={() => { setPopoverOpen(false); setMobileOpen(false); navigate('/profile') }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <User size={16} /> Meu Perfil
                </button>
                <button onClick={() => { setPopoverOpen(false); setMobileOpen(false); navigate('/settings') }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Settings size={16} /> Configurações
                </button>
                <button onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                </button>
              </div>
              <div className="border-t border-gray-100 dark:border-white/5 py-1">
                <button onClick={() => { setPopoverOpen(false); logout() }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>
          )}

          {/* User avatar button */}
          {user && (
            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              className={`flex items-center gap-3 w-full py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group
                ${collapsed ? 'justify-center px-0 lg:justify-center' : 'px-3'}`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.nome}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 truncate">{user.email}</p>
                </div>
              )}
              <div className="flex-1 min-w-0 text-left lg:hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.nome}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 truncate">{user.email}</p>
              </div>
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 pt-16 lg:pt-0 min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
