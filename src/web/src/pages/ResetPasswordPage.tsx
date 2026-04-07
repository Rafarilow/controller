import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import { KeyRound, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState((location.state as { token?: string })?.token ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) { setError('As senhas não coincidem'); return }
    if (newPassword.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return }

    setLoading(true)
    setError('')
    try {
      await resetPassword(token, newPassword)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Token inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/icon.png" alt="Controller" className="h-12 object-contain" />
        </div>

        <div className="bg-white dark:bg-[#0A0A0C] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-8">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <KeyRound size={26} className="text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Senha redefinida!</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all text-sm"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Redefinir senha</h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Insira o token de recuperação e escolha uma nova senha
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Token de recuperação"
                    required
                    className={inputClass + " pl-10 font-mono text-xs"}
                  />
                </div>

                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    required
                    className={inputClass + " pl-10 pr-10"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirmar nova senha"
                    required
                    className={inputClass + " pl-10"}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </form>

              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-5 mx-auto"
              >
                <ArrowLeft size={14} /> Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
