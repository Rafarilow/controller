import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react'
import { getExpenses, createExpense, updateExpense, deleteExpense, getCategories } from '../api/expenses'
import type { Expense, UserCategory } from '../types'
import { Plus, Pencil, Trash2, X, Check, Wallet, Calendar, TrendingUp, ArrowUpRight, FileText, Tag, DollarSign, UtensilsCrossed, Car, Heart, GraduationCap, Gamepad2, Home, Shirt, Package } from 'lucide-react'

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Casa', 'Roupas', 'Outros']

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ data: '', descricao: '', categoria: 'Alimentação', valor: '' })
  const [editForm, setEditForm] = useState({ data: '', descricao: '', categoria: '', valor: '' })

  const categories = userCategories.length > 0 ? userCategories.map(c => c.nome) : DEFAULT_CATEGORIES

  const total = expenses.reduce((sum, e) => sum + e.valor, 0)
  const thisMonth = expenses.filter(e => e.data.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + e.valor, 0)
  const lastMonthTotal = expenses.filter(e => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return e.data.startsWith(d.toISOString().slice(0, 7))
  }).reduce((s, e) => s + e.valor, 0)
  const growthPct = lastMonthTotal > 0 ? ((thisMonth - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : '0'

  const loadExpenses = useCallback(async () => {
    const res = await getExpenses()
    setExpenses(res.data)
  }, [])

  useEffect(() => {
    loadExpenses()
    getCategories().then(res => setUserCategories(res.data)).catch(() => {})
  }, [loadExpenses])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    await createExpense({ ...form, valor: parseFloat(form.valor) || 0 })
    setForm({ data: '', descricao: '', categoria: 'Alimentação', valor: '' })
    loadExpenses()
  }

  const handleEdit = async (id: string) => {
    await updateExpense(id, { ...editForm, valor: parseFloat(editForm.valor) || 0 })
    setEditingId(null); loadExpenses()
  }

  const handleDelete = async (id: string) => { await deleteExpense(id); loadExpenses() }

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id)
    setEditForm({ data: exp.data, descricao: exp.descricao, categoria: exp.categoria, valor: String(exp.valor) })
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
      const key = e.data.slice(0, 7)
      map[key] = (map[key] || 0) + e.valor
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-6)
  }, [expenses])

  const maxMonthly = Math.max(...monthlyData.map(d => d[1]), 1)
  const currentMonthKey = new Date().toISOString().slice(0, 7)

  // Top categories
  const CATEGORY_ICONS: Record<string, typeof UtensilsCrossed> = {
    'Alimentação': UtensilsCrossed, 'Transporte': Car, 'Saúde': Heart, 'Educação': GraduationCap,
    'Lazer': Gamepad2, 'Casa': Home, 'Roupas': Shirt, 'Outros': Package,
  }
  const CATEGORY_COLORS = ['from-emerald-500 to-teal-500', 'from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-orange-500 to-red-500', 'from-cyan-500 to-blue-500']
  const BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-orange-500', 'bg-cyan-500']

  const topCategories = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => { map[e.categoria] = (map[e.categoria] || 0) + e.valor })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [expenses])

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Visão geral das suas finanças</p>
      </div>

      {/* Stats Grid - Finex inspired */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={80} />
          </div>
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Geral</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{fmt(total)}</p>
          <div className="mt-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
              <ArrowUpRight size={10} className="inline -mt-0.5" /> {expenses.length} despesas
            </span>
          </div>
        </div>

        {/* Monthly */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar size={80} />
          </div>
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Este Mês</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{fmt(thisMonth)}</p>
          <div className="mt-2">
            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-300 text-[11px] font-medium border border-gray-200 dark:border-white/10">
              {growthPct}% vs mês anterior
            </span>
          </div>
        </div>

        {/* Featured Card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400/30 shadow-lg text-white relative overflow-hidden group cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mb-1">Categoria Top</p>
          <p className="text-xl font-bold tracking-tight relative z-10">
            {expenses.length > 0
              ? Object.entries(expenses.reduce((acc, e) => ({ ...acc, [e.categoria]: (acc[e.categoria as keyof typeof acc] || 0) + e.valor }), {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
              : '—'}
          </p>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            <TrendingUp size={12} className="text-emerald-200" />
            <span className="text-[11px] text-emerald-100 font-medium">Maior gasto acumulado</span>
          </div>
        </div>
      </div>

      {/* Charts Row - Finex inspired */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Monthly Spending Chart - like User Growth */}
          <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#101018] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Gastos Mensais</h3>
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Últimos {monthlyData.length} meses</p>
                </div>
                {monthlyData.length > 1 && (
                  <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-300">{growthPct}% vs mês anterior</span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Bar Chart */}
            <div className="px-5 sm:px-8 pb-2">
              <div className="flex items-end gap-2 sm:gap-4" style={{ height: '220px' }}>
                {monthlyData.map(([month, value]) => {
                  const pct = (value / maxMonthly) * 100
                  const isCurrent = month === currentMonthKey
                  return (
                    <div key={month} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group cursor-pointer">
                      {/* Tooltip */}
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1A24] border border-gray-200 dark:border-white/10 shadow-sm text-[11px] font-semibold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {fmt(value)}
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-lg relative transition-all duration-500 ${isCurrent ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-gray-200 dark:bg-white/[0.07] group-hover:bg-gray-300 dark:group-hover:bg-white/10'}`}
                        style={{ height: `${Math.max(pct, 5)}%` }}
                      >
                        {isCurrent && <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-t-lg" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Labels */}
            <div className="px-5 sm:px-8 pb-5 flex gap-2 sm:gap-4">
              {monthlyData.map(([month]) => {
                const isCurrent = month === currentMonthKey
                const [y, m] = month.split('-').map(Number)
                const label = new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
                return (
                  <div key={month} className="flex-1 text-center">
                    <span className={`text-xs font-medium capitalize ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Categories - like Top Sources */}
          <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#101018] border border-gray-200 dark:border-white/10 shadow-sm p-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Top Categorias</h3>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Maiores gastos</p>
            </div>

            {/* Total with trend */}
            <div className="mb-5">
              <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{fmt(total)}</span>
              <span className="ml-2 text-[11px] font-medium text-emerald-500">
                <TrendingUp size={10} className="inline -mt-0.5" /> {topCategories.length} categorias
              </span>
            </div>

            {/* Category list - like Top Sources */}
            <div className="space-y-3">
              {topCategories.map(([cat, val], i) => {
                const Icon = CATEGORY_ICONS[cat] || Package
                const pct = total > 0 ? (val / total * 100).toFixed(0) : '0'
                return (
                  <div key={cat} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(val)}</span>
                      </div>
                      <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {topCategories.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">Sem dados ainda</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Plus size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Nova Despesa</h2>
        </div>
        <form onSubmit={handleAdd} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-3">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} required className={inputClass + " pl-9"} />
          </div>
          <div className="relative">
            <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required placeholder="Descrição" className={inputClass + " pl-9"} />
          </div>
          <div className="relative">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className={inputClass + " pl-9"}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required placeholder="0,00" className={inputClass + " pl-9"} />
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm shadow-sm">
            <Plus size={16} /> Adicionar
          </button>
        </form>
      </div>

      {/* Transactions List - Finex inspired */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center">
              <FileText size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Transações Recentes</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-600">Histórico completo de despesas</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">{expenses.length}</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Data</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Descrição</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Categoria</th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Valor</th>
                <th className="px-5 py-3 text-right text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, i) => (
                <tr key={exp.id} className={`group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i < expenses.length - 1 ? 'border-b border-gray-50 dark:border-white/[0.03]' : ''}`}>
                  {editingId === exp.id ? (
                    <>
                      <td className="px-5 py-3"><input type="date" value={editForm.data} onChange={e => setEditForm({ ...editForm, data: e.target.value })} className="px-2 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg dark:bg-[#111] dark:text-white text-sm w-full focus:outline-none focus:border-emerald-500" /></td>
                      <td className="px-5 py-3"><input type="text" value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })} className="px-2 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg dark:bg-[#111] dark:text-white text-sm w-full focus:outline-none focus:border-emerald-500" /></td>
                      <td className="px-5 py-3"><select value={editForm.categoria} onChange={e => setEditForm({ ...editForm, categoria: e.target.value })} className="px-2 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg dark:bg-[#111] dark:text-white text-sm focus:outline-none focus:border-emerald-500">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></td>
                      <td className="px-5 py-3"><input type="number" step="0.01" value={editForm.valor} onChange={e => setEditForm({ ...editForm, valor: e.target.value })} className="px-2 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg dark:bg-[#111] dark:text-white text-sm w-28 focus:outline-none focus:border-emerald-500" /></td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button onClick={() => handleEdit(exp.id)} className="text-emerald-500 hover:text-emerald-400"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300"><X size={16} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500 font-medium">{exp.data}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{exp.descricao}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">{exp.categoria}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{fmt(exp.valor)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(exp)} className="w-7 h-7 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"><Pencil size={13} /></button>
                          <button onClick={() => handleDelete(exp.id)} className="w-7 h-7 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-gray-400 dark:text-gray-600 text-sm">Nenhuma despesa cadastrada</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-50 dark:divide-white/[0.03]">
          {expenses.map(exp => (
            <div key={exp.id} className="p-4">
              {editingId === exp.id ? (
                <div className="space-y-2">
                  <input type="date" value={editForm.data} onChange={e => setEditForm({ ...editForm, data: e.target.value })} className={inputClass} />
                  <input type="text" value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })} className={inputClass} />
                  <select value={editForm.categoria} onChange={e => setEditForm({ ...editForm, categoria: e.target.value })} className={inputClass}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <input type="number" step="0.01" value={editForm.valor} onChange={e => setEditForm({ ...editForm, valor: e.target.value })} className={inputClass} />
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleEdit(exp.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"><Check size={14} /> Salvar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 flex items-center justify-center gap-1"><X size={14} /> Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{exp.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-gray-400 dark:text-gray-600">{exp.data}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">{exp.categoria}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(exp.valor)}</span>
                    <button onClick={() => startEdit(exp)} className="text-gray-300 dark:text-gray-700 hover:text-emerald-500 transition"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(exp.id)} className="text-gray-300 dark:text-gray-700 hover:text-red-500 transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="p-10 text-center text-gray-400 dark:text-gray-600 text-sm">Nenhuma despesa cadastrada</div>
          )}
        </div>
      </div>
    </div>
  )
}
