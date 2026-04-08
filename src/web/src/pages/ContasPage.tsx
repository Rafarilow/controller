import { useState, useEffect, type FormEvent } from 'react'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/accounts'
import type { Account, AccountTipo } from '../types'
import { Plus, Trash2, Wallet, Edit2, CreditCard, PiggyBank, Banknote, TrendingUp, Building } from 'lucide-react'

const TIPO_LABELS: Record<AccountTipo, string> = {
  ContaCorrente: 'Conta Corrente',
  Poupanca: 'Poupança',
  Cartao: 'Cartão de Crédito',
  Dinheiro: 'Dinheiro',
  Investimento: 'Investimento',
}
const TIPO_ICONS: Record<AccountTipo, any> = {
  ContaCorrente: Building,
  Poupanca: PiggyBank,
  Cartao: CreditCard,
  Dinheiro: Banknote,
  Investimento: TrendingUp,
}
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#22c55e', '#0ea5e9', '#9333ea', '#f59e0b', '#ec4899']

export default function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form, setForm] = useState({ nome: '', tipo: 'ContaCorrente' as AccountTipo, saldoInicial: '', cor: '#10b981' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await getAccounts()
    setAccounts(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startCreate = () => {
    setEditing(null)
    setForm({ nome: '', tipo: 'ContaCorrente', saldoInicial: '', cor: '#10b981' })
    setShowForm(true)
  }

  const startEdit = (a: Account) => {
    setEditing(a)
    setForm({ nome: a.nome, tipo: a.tipo, saldoInicial: String(a.saldoInicial), cor: a.cor })
    setShowForm(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = { nome: form.nome, tipo: form.tipo, saldoInicial: parseFloat(form.saldoInicial) || 0, cor: form.cor }
      if (editing) await updateAccount(editing.id, { ...payload, ativo: editing.ativo })
      else await createAccount(payload)
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
    if (!confirm('Desativar esta conta? O histórico será mantido.')) return
    await deleteAccount(id)
    load()
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  const totalSaldo = accounts.filter(a => a.ativo).reduce((s, a) => s + a.saldoAtual, 0)
  const saldoColor = totalSaldo >= 0 ? 'text-emerald-500' : 'text-red-500'

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Contas</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Gerencie suas contas bancárias, cartões e investimentos</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Nova Conta
        </button>
      </div>

      {/* Saldo total */}
      {accounts.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-5">
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Saldo total</p>
          <p className={`text-3xl font-bold mt-1 ${saldoColor}`}>{fmt(totalSaldo)}</p>
          <p className="text-[11px] text-gray-500 mt-1">{accounts.filter(a => a.ativo).length} conta(s) ativa(s)</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-emerald-500" /> {editing ? 'Editar' : 'Nova'} Conta
          </h3>
          {error && <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Nome</label>
                <input className={inputClass} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Nubank, Itaú..." required />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Tipo</label>
                <select className={inputClass} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as AccountTipo })}>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 block">Saldo inicial</label>
                <input type="number" step="0.01" className={inputClass} value={form.saldoInicial} onChange={e => setForm({ ...form, saldoInicial: e.target.value })} placeholder="0,00" />
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

      {/* List */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-12">Carregando...</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
          <Wallet size={36} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500">Nenhuma conta cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map(a => {
            const Icon = TIPO_ICONS[a.tipo]
            return (
              <div key={a.id} className={`rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5 transition-all ${a.ativo ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: a.cor }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.nome}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{TIPO_LABELS[a.tipo]}</p>
                    </div>
                  </div>
                  {!a.ativo && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-500/10 text-gray-500">Inativa</span>}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-500">Saldo atual</p>
                  <p className={`text-2xl font-bold ${a.saldoAtual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmt(a.saldoAtual)}</p>
                  <p className="text-[10px] text-gray-400">Inicial: {fmt(a.saldoInicial)}</p>
                </div>
                <div className="flex gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                  <button onClick={() => startEdit(a)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500">
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
