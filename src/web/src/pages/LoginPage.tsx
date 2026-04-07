import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet, TrendingUp, PieChart, Shield } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-8">
          <div>
            <img src="/icon.png" alt="Controller" className="h-20 w-fit object-contain" />
            <h1 className="text-[32px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mt-2">Bem-vindo de volta</h1>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] mt-1">Entre com suas credenciais para continuar</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm animate-fade-in">
              <Shield size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/80 text-gray-900 dark:text-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] outline-none transition-all placeholder:text-gray-400"
                  placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Senha</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/80 text-gray-900 dark:text-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] outline-none transition-all placeholder:text-gray-400"
                  placeholder="Digite sua senha" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0">
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              {!loading && <ArrowRight size={18} />}
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-gray-50 dark:bg-slate-950 px-3 text-gray-400">ou</span></div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Ainda não tem uma conta?{' '}
            <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">Criar conta</Link>
          </p>
        </div>
      </div>

      {/* Right - Green Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-white/[0.07] rounded-full -top-32 -right-32 blur-sm" />
        <div className="absolute w-80 h-80 bg-white/[0.05] rounded-full bottom-0 -left-20 blur-sm" />
        <div className="absolute w-40 h-40 bg-white/[0.08] rounded-full top-1/3 left-1/4" />

        <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-10">
          {/* Headline */}
          <h2 className="text-3xl font-extrabold text-white text-center leading-tight">
            Suas finanças no<br />controle total
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[
              { icon: Wallet, value: 'R$ 12.450', label: 'Total' },
              { icon: PieChart, value: 'R$ 3.280', label: 'Mensal' },
              { icon: TrendingUp, value: '+15%', label: 'Economia' },
            ].map((card, i) => (
              <div key={i} className="animate-float bg-white/15 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 flex flex-col items-center gap-1.5" style={{ animationDelay: `${i * 0.7}s` }}>
                <card.icon size={16} className="text-white/80" />
                <p className="text-white font-bold text-sm leading-none">{card.value}</p>
                <p className="text-white/60 text-[10px]">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Features — icon + short label */}
          <div className="flex gap-6">
            {[
              { icon: PieChart, label: 'Relatórios' },
              { icon: Shield, label: 'Seguro' },
              { icon: TrendingUp, label: 'Insights' },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                  <feat.icon size={18} className="text-white/80" />
                </div>
                <span className="text-white/70 text-xs font-medium">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
