import { useState, useEffect, type FormEvent } from 'react'
import { getGoals, createGoal, updateGoal, contribuirGoal, deleteGoal } from '../api/goals'
import type { Goal } from '../types'
import { Plus, Trash2, Trophy, Edit2, TrendingUp, Calendar, X } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#22c55e', '#0ea5e9', '#9333ea', '#f59e0b', '#ec4899']

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState({ nome: '', valorAlvo: '', dataAlvo: '', cor: '#10b981', descricao: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [contribInput, setContribInput] = useState<Record<string, string>>({})
  const [showContribFor, setShowContribFor] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await getGoals()
    setGoals(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startCreate = () => {
    setEditing(null)
    setForm({ nome: '', valorAlvo: '', dataAlvo: '', cor: '#10b981', descricao: '' })
    setShowForm(true)
  }

  const startEdit = (g: Goal) => {
    setEditing(g)
    setForm({ nome: g.nome, valorAlvo: String(g.valorAlvo), dataAlvo: g.dataAlvo || '', cor: g.cor, descricao: g.descricao || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        nome: form.nome,
        valorAlvo: parseFloat(form.valorAlvo) || 0,
        dataAlvo: form.dataAlvo || null,
        cor: form.cor,
        descricao: form.descricao || null,
      }
      if (editing) await updateGoal(editing.id, payload)
      else await createGoal(payload)
      setShowForm(false)
      setEditing(null)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erro')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContribuir = async (id: string) => {
    const valor = parseFloat(contribInput[id] || '0')
    if (!valor) return
    await contribuirGoal(id, valor)
    setContribInput({ ...contribInput, [id]: '' })
    setShowContribFor(null)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar esta meta?')) return
    await deleteGoal(id)
    load()
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  const daysUntil = (date: string) => {
    const d = new Date(date + 'T00:00:00')
    const now = new Date()
    const ms = d.getTime() - now.getTime()
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Metas</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Defina objetivos financeiros e acompanhe o progresso</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-emerald-500" /> {editing ? 'Editar' : 'Nova'} Meta
          </h3>
          {error && <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Nome</label>
                <input className={inputClass} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Viagem Japão" required />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Valor alvo</label>
                <input type="number" step="0.01" min="0.01" className={inputClass} value={form.valorAlvo} onChange={e => setForm({ ...form, valorAlvo: e.target.value })} required />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Data alvo (opcional)</label>
                <input type="date" className={inputClass} value={form.dataAlvo} onChange={e => setForm({ ...form, dataAlvo: e.target.value })} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Cor</label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, cor: c })}
                      className={`w-8 h-8 rounded-lg transition-all ${form.cor === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0A0A0C] ring-emerald-500 scale-110' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Descrição (opcional)</label>
                <input className={inputClass} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-500">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-12">Carregando...</p>
      ) : goals.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
          <Trophy size={36} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500">Nenhuma meta cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map(g => {
            const remaining = g.valorAlvo - g.valorAtual
            const days = g.dataAlvo ? daysUntil(g.dataAlvo) : null
            return (
              <div key={g.id} className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: g.cor }}>
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{g.nome}</p>
                      {g.descricao && <p className="text-[11px] text-gray-500 mt-0.5">{g.descricao}</p>}
                    </div>
                  </div>
                  {g.percentual >= 100 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      ✓ Concluída
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold" style={{ color: g.cor }}>{fmt(g.valorAtual)}</p>
                    <p className="text-sm text-gray-500">de {fmt(g.valorAlvo)}</p>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full transition-all rounded-full" style={{ width: `${Math.min(100, g.percentual)}%`, backgroundColor: g.cor }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>{g.percentual.toFixed(1)}%</span>
                    {remaining > 0 && <span>Faltam {fmt(remaining)}</span>}
                  </div>
                </div>
                {days !== null && (
                  <div className={`flex items-center gap-1.5 text-[11px] mb-3 ${days < 0 ? 'text-red-500' : days < 30 ? 'text-amber-500' : 'text-gray-500'}`}>
                    <Calendar size={11} />
                    {days < 0 ? `${Math.abs(days)} dias atrasada` : days === 0 ? 'Vence hoje!' : `${days} dias restantes`}
                  </div>
                )}
                {showContribFor === g.id ? (
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                    <input type="number" step="0.01" placeholder="Valor"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      value={contribInput[g.id] || ''} onChange={e => setContribInput({ ...contribInput, [g.id]: e.target.value })} autoFocus />
                    <button onClick={() => handleContribuir(g.id)} className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-500 text-white">Adicionar</button>
                    <button onClick={() => setShowContribFor(null)} className="inline-flex items-center justify-center px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500"><X size={12}/></button>
                  </div>
                ) : (
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                    <button onClick={() => setShowContribFor(g.id)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={12} /> Contribuir
                    </button>
                    <button onClick={() => startEdit(g)} className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-medium rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
