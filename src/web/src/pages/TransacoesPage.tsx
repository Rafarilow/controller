import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { getExpenses, createExpense, deleteExpense, getReceitas, createReceita, deleteReceita, getCategories } from '../api/expenses'
import type { Expense, Receita, UserCategory } from '../types'
import { Plus, Trash2, TrendingDown, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Calendar, FileText, Tag, DollarSign } from 'lucide-react'
import PeriodFilter, { PRESETS, type PeriodRange } from '../components/PeriodFilter'

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Casa', 'Roupas', 'Outros']
const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Bônus', 'Outros']

type Tab = 'todas' | 'despesas' | 'receitas'
type FormTab = 'despesa' | 'receita'

export default function TransacoesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [tab, setTab] = useState<Tab>('todas')
  const [formTab, setFormTab] = useState<FormTab>('despesa')
  const [period, setPeriod] = useState<PeriodRange>(PRESETS[0])

  const [expenseForm, setExpenseForm] = useState({ data: '', descricao: '', categoria: 'Alimentação', valor: '' })
  const [receitaForm, setReceitaForm] = useState({ data: '', descricao: '', categoria: 'Salário', valor: '', tipo: 'Fixa' })

  const categories = userCategories.length > 0 ? userCategories.map(c => c.nome) : DEFAULT_CATEGORIES

  const loadAll = useCallback(async () => {
    const [expRes, recRes] = await Promise.all([
      getExpenses({ from: period.from, to: period.to }),
      getReceitas({ from: period.from, to: period.to }),
    ])
    setExpenses(expRes.data)
    setReceitas(recRes.data)
  }, [period])

  useEffect(() => {
    loadAll()
    getCategories().then(res => setUserCategories(res.data)).catch(() => {})
  }, [loadAll])

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault()
    await createExpense({ ...expenseForm, valor: parseFloat(expenseForm.valor) || 0 })
    setExpenseForm({ data: '', descricao: '', categoria: categories[0] || 'Alimentação', valor: '' })
    loadAll()
  }

  const handleAddReceita = async (e: FormEvent) => {
    e.preventDefault()
    await createReceita({ ...receitaForm, valor: parseFloat(receitaForm.valor) || 0 })
    setReceitaForm({ data: '', descricao: '', categoria: 'Salário', valor: '', tipo: 'Fixa' })
    loadAll()
  }

  const handleDeleteExpense = async (id: string) => { await deleteExpense(id); loadAll() }
  const handleDeleteReceita = async (id: string) => { await deleteReceita(id); loadAll() }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  const totalDespesas = expenses.reduce((s, e) => s + e.valor, 0)
  const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0)
  const saldo = totalReceitas - totalDespesas

  // Unified transaction list
  type TxEntry = { id: string; data: string; descricao: string; categoria: string; valor: number; tipo: 'despesa' | 'receita'; subTipo?: string }
  const allTx: TxEntry[] = [
    ...expenses.map(e => ({ id: e.id, data: e.data, descricao: e.descricao, categoria: e.categoria, valor: e.valor, tipo: 'despesa' as const })),
    ...receitas.map(r => ({ id: r.id, data: r.data, descricao: r.descricao, categoria: r.categoria, valor: r.valor, tipo: 'receita' as const, subTipo: r.tipo })),
  ].sort((a, b) => b.data.localeCompare(a.data))

  const filtered = tab === 'todas' ? allTx : tab === 'despesas' ? allTx.filter(t => t.tipo === 'despesa') : allTx.filter(t => t.tipo === 'receita')

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Transações</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Gerencie receitas e despesas</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white border border-emerald-400/30 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1">
            <ArrowUpRight size={11} /> Total Receitas
          </div>
          <p className="text-lg sm:text-2xl font-bold tracking-tight relative z-10">{fmt(totalReceitas)}</p>
          <p className="text-[11px] text-emerald-200 mt-1 relative z-10">{receitas.length} lançamentos</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative overflow-hidden group">
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1">
            <ArrowDownRight size={11} /> Total Despesas
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{fmt(totalDespesas)}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">{expenses.length} lançamentos</p>
        </div>

        <div className={`p-4 sm:p-5 rounded-xl border shadow-sm transition-all relative overflow-hidden group ${saldo >= 0 ? 'bg-white dark:bg-[#0A0A0C] border-gray-200 dark:border-white/10' : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'}`}>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500">
            <Wallet size={11} /> Saldo
          </div>
          <p className={`text-lg sm:text-2xl font-bold tracking-tight ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmt(saldo)}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">{saldo >= 0 ? 'Positivo' : 'Negativo'} no período</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm">
        {/* Form Tab Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFormTab('despesa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formTab === 'despesa' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
          >
            <TrendingDown size={14} /> Nova Despesa
          </button>
          <button
            onClick={() => setFormTab('receita')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formTab === 'receita' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
          >
            <TrendingUp size={14} /> Nova Receita
          </button>
        </div>

        {formTab === 'despesa' ? (
          <form onSubmit={handleAddExpense} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-3">
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="date" value={expenseForm.data} onChange={e => setExpenseForm({ ...expenseForm, data: e.target.value })} required className={inputClass + " pl-9"} />
            </div>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={expenseForm.descricao} onChange={e => setExpenseForm({ ...expenseForm, descricao: e.target.value })} required placeholder="Descrição" className={inputClass + " pl-9"} />
            </div>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select value={expenseForm.categoria} onChange={e => setExpenseForm({ ...expenseForm, categoria: e.target.value })} className={inputClass + " pl-9"}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="number" step="0.01" value={expenseForm.valor} onChange={e => setExpenseForm({ ...expenseForm, valor: e.target.value })} required placeholder="0,00" className={inputClass + " pl-9"} />
            </div>
            <button type="submit" className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm shadow-sm">
              <Plus size={16} /> Adicionar
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddReceita} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:gap-3">
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="date" value={receitaForm.data} onChange={e => setReceitaForm({ ...receitaForm, data: e.target.value })} required className={inputClass + " pl-9"} />
            </div>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={receitaForm.descricao} onChange={e => setReceitaForm({ ...receitaForm, descricao: e.target.value })} required placeholder="Descrição" className={inputClass + " pl-9"} />
            </div>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select value={receitaForm.categoria} onChange={e => setReceitaForm({ ...receitaForm, categoria: e.target.value })} className={inputClass + " pl-9"}>
                {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="number" step="0.01" value={receitaForm.valor} onChange={e => setReceitaForm({ ...receitaForm, valor: e.target.value })} required placeholder="0,00" className={inputClass + " pl-9"} />
            </div>
            <select value={receitaForm.tipo} onChange={e => setReceitaForm({ ...receitaForm, tipo: e.target.value })} className={inputClass}>
              <option value="Fixa">Fixa (Salário)</option>
              <option value="Variavel">Variável</option>
            </select>
            <button type="submit" className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm shadow-sm">
              <Plus size={16} /> Adicionar
            </button>
          </form>
        )}
      </div>

      {/* Transaction List */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="px-5 pt-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-1">
          {(['todas', 'despesas', 'receitas'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize ${tab === t ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 -mb-px' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t === 'todas' ? `Todas (${allTx.length})` : t === 'despesas' ? `Despesas (${expenses.length})` : `Receitas (${receitas.length})`}
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Data</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Descrição</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Categoria</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Tipo</th>
                <th className="px-5 py-3 text-right text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Valor</th>
                <th className="px-5 py-3 text-right text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr key={`${tx.tipo}-${tx.id}`} className={`group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-50 dark:border-white/[0.03]' : ''}`}>
                  <td className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500 font-medium">{tx.data}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{tx.descricao}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${tx.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'}`}>
                      {tx.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {tx.tipo === 'receita' ? <TrendingUp size={13} className="text-emerald-500" /> : <TrendingDown size={13} className="text-red-500" />}
                      <span className={`text-xs font-medium ${tx.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {tx.tipo === 'receita' ? (tx.subTipo === 'Fixa' ? 'Fixa' : 'Variável') : 'Despesa'}
                      </span>
                    </div>
                  </td>
                  <td className={`px-5 py-4 text-sm font-semibold text-right ${tx.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {tx.tipo === 'receita' ? '+' : '-'}{fmt(tx.valor)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => tx.tipo === 'despesa' ? handleDeleteExpense(tx.id) : handleDeleteReceita(tx.id)}
                      className="w-7 h-7 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400 dark:text-gray-600 text-sm">Nenhuma transação no período</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-50 dark:divide-white/[0.03]">
          {filtered.map(tx => (
            <div key={`${tx.tipo}-${tx.id}`} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.tipo === 'receita' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {tx.tipo === 'receita' ? <TrendingUp size={15} className="text-emerald-500" /> : <TrendingDown size={15} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{tx.descricao}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400 dark:text-gray-600">{tx.data}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${tx.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{tx.categoria}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-3 shrink-0">
                <span className={`text-sm font-semibold ${tx.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                  {tx.tipo === 'receita' ? '+' : '-'}{fmt(tx.valor)}
                </span>
                <button onClick={() => tx.tipo === 'despesa' ? handleDeleteExpense(tx.id) : handleDeleteReceita(tx.id)} className="text-gray-300 dark:text-gray-700 hover:text-red-500 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-gray-400 dark:text-gray-600 text-sm">Nenhuma transação no período</div>
          )}
        </div>
      </div>
    </div>
  )
}
