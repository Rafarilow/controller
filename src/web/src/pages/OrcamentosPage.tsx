import { useState, useEffect, type FormEvent } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets'
import { getCategories } from '../api/expenses'
import type { Budget, UserCategory } from '../types'
import { Plus, Trash2, Target, Edit2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Casa', 'Roupas', 'Outros']

export default function OrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form, setForm] = useState({ categoria: '', valorLimite: '', periodo: 'Mensal' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const cats = userCategories.length > 0 ? userCategories.map(c => c.nome) : DEFAULT_CATEGORIES

  const load = async () => {
    setLoading(true)
    const res = await getBudgets()
    setBudgets(res.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    getCategories().then(r => setUserCategories(r.data)).catch(() => {})
  }, [])

  const startEdit = (b: Budget) => {
    setEditing(b)
    setForm({ categoria: b.categoria, valorLimite: String(b.valorLimite), periodo: b.periodo })
    setShowForm(true)
  }

  const startCreate = () => {
    setEditing(null)
    setForm({ categoria: cats[0] || 'Alimentação', valorLimite: '', periodo: 'Mensal' })
    setShowForm(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = { categoria: form.categoria, valorLimite: parseFloat(form.valorLimite) || 0, periodo: form.periodo }
      if (editing) await updateBudget(editing.id, payload)
      else await createBudget(payload)
      setShowForm(false)
      setEditing(null)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erro')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este orçamento?')) return
    await deleteBudget(id)
    load()
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  const totalLimite = budgets.reduce((s, b) => s + b.valorLimite, 0)
  const totalGasto = budgets.reduce((s, b) => s + b.gastoAtual, 0)
  const totalPct = totalLimite > 0 ? (totalGasto / totalLimite) * 100 : 0

  const statusIcon = (s: string) => s === 'estourado' ? AlertTriangle : s === 'alerta' ? AlertCircle : CheckCircle
  const STATUS_STYLES = {
    ok: { badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-600 dark:text-emerald-400', valueText: 'text-emerald-600 dark:text-emerald-400', barBg: 'bg-emerald-500', label: 'OK' },
    alerta: { badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-600 dark:text-amber-400', valueText: 'text-amber-600 dark:text-amber-400', barBg: 'bg-amber-500', label: 'Alerta' },
    estourado: { badgeBg: 'bg-red-500/10', badgeText: 'text-red-600 dark:text-red-400', valueText: 'text-red-600 dark:text-red-400', barBg: 'bg-red-500', label: 'Estourado' },
  } as const

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Orçamentos</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Defina limites mensais por categoria</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Novo Orçamento
        </button>
      </div>

      {/* Total */}
      {budgets.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total do mês</p>
            <p className="text-sm text-gray-500">{fmt(totalGasto)} / {fmt(totalLimite)}</p>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full transition-all rounded-full ${totalPct >= 100 ? 'bg-red-500' : totalPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, totalPct)}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{totalPct.toFixed(1)}% utilizado</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={16} className="text-emerald-500" /> {editing ? 'Editar' : 'Novo'} Orçamento
          </h3>
          {error && <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">Categoria</label>
              <select className={inputClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} required>
                <option value="">Selecione...</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">Valor limite</label>
              <input type="number" step="0.01" min="0.01" className={inputClass} value={form.valorLimite} onChange={e => setForm({ ...form, valorLimite: e.target.value })} placeholder="0,00" required />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 mb-1 block">Período</label>
              <select className={inputClass} value={form.periodo} onChange={e => setForm({ ...form, periodo: e.target.value })}>
                <option value="Mensal">Mensal</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-500">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-12">Carregando...</p>
      ) : budgets.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
          <Target size={36} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500">Nenhum orçamento cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgets.map(b => {
            const styles = STATUS_STYLES[b.status]
            const Icon = statusIcon(b.status)
            return (
              <div key={b.id} className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.categoria}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{b.periodo}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles.badgeBg} ${styles.badgeText} inline-flex items-center gap-1`}>
                    <Icon size={10} /> {styles.label}
                  </span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-[11px] text-gray-500">Gasto / Limite</p>
                    <p className={`text-lg font-bold ${styles.valueText}`}>{fmt(b.gastoAtual)}</p>
                  </div>
                  <p className="text-sm text-gray-500">de {fmt(b.valorLimite)}</p>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${styles.barBg} transition-all rounded-full`} style={{ width: `${Math.min(100, b.percentual)}%` }} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">{b.percentual.toFixed(1)}% utilizado</p>

                <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                  <button onClick={() => startEdit(b)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
