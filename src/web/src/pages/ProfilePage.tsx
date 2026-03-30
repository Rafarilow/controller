import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { updateProfile, changePassword } from '../api/auth'
import { User, Shield, Palette, Info, Check, AlertCircle, Sun, Moon } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const [nome, setNome] = useState(user?.nome || '')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)
    setProfileLoading(true)
    try {
      await updateProfile(nome)
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso' })
    } catch {
      setProfileMsg({ type: 'error', text: 'Erro ao atualizar perfil' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem' })
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setPasswordMsg({ type: 'error', text: msg || 'Erro ao alterar senha' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pt-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações</h1>
        <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <User size={16} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Informações Pessoais</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-600">Atualize seus dados de perfil</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="p-5 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
              {user?.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.nome}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled className={inputClass + " opacity-50 cursor-not-allowed"} />
          </div>

          {profileMsg && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${profileMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {profileMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {profileMsg.text}
            </div>
          )}

          <button type="submit" disabled={profileLoading} className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50">
            {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Palette size={16} className="text-violet-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Aparência</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-600">Personalize a interface</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={18} className="text-gray-400" /> : <Sun size={18} className="text-gray-400" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Modo Escuro</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-600">Alternar entre tema claro e escuro</p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Shield size={16} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Segurança</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-600">Altere sua senha de acesso</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Senha Atual</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={inputClass} placeholder="Digite sua senha atual" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nova Senha</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Confirmar Nova Senha</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="Repita a nova senha" />
          </div>

          {passwordMsg && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {passwordMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {passwordMsg.text}
            </div>
          )}

          <button type="submit" disabled={passwordLoading} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50">
            {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* About */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Info size={16} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Sobre</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-600">Informações do aplicativo</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Versão</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Stack</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">.NET 10 + React</span>
          </div>
        </div>
      </div>
    </div>
  )
}
