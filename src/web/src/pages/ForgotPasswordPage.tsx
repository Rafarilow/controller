import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import { Mail, ArrowLeft, Copy, Check, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await forgotPassword(email)
      setToken(res.data.token)
    } catch {
      setError('Email não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/icon.png" alt="Controller" className="h-12 object-contain" />
        </div>

        <div className="bg-white dark:bg-[#0A0A0C] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-8">
          {!token ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Esqueci minha senha</h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Informe seu email para gerar um token de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? 'Gerando token...' : 'Gerar token de recuperação'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={22} className="text-emerald-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">Token gerado!</h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-center">
                  Copie o token abaixo e use-o para redefinir sua senha. Ele expira em <strong>1 hora</strong>.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-gray-700 dark:text-gray-300 break-all flex-1">{token}</code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/reset-password', { state: { token } })}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all text-sm"
              >
                Ir para redefinição de senha
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-5 mx-auto"
          >
            <ArrowLeft size={14} /> Voltar ao login
          </button>
        </div>
      </div>
    </div>
  )
}
