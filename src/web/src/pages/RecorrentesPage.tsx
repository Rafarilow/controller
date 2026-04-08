import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { getRecurring, createRecurring, updateRecurring, deleteRecurring, runRecurring, type CreateRecurringPayload } from '../api/recurring'
import { getCategories } from '../api/expenses'
import type { RecurringTransaction, UserCategory } from '../types'
import { Plus, Trash2, Repeat, Play, Pause, Calendar, Tag, DollarSign, FileText, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

const DEFAULT_EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Casa', 'Roupas', 'Outros']
const DEFAULT_INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Bônus', 'Outros']
const FREQ_LABELS: Record<string, string> = { Mensal: 'Mensal', Semanal: 'Semanal', Anual: 'Anual' }
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

type Tab = 'todas' | 'despesas' | 'receitas'

const todayIso = () => new Date().toISOString().slice(0, 10)

const initialForm: CreateRecurringPayload = {
  tipo: 'Despesa',
  descricao: '',
  categoria: 'Casa',
  valor: 0,
  frequencia: 'Mensal',
  diaCobranca: 5,
  dataInicio: todayIso(),
  dataFim: null,
  tipoReceita: 'Fixa',
}

export default function RecorrentesPage() {
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [tab, setTab] = useState<Tab>('todas')
  const [form, setForm] = useState<CreateRecurringPayload>(initialForm)
  const [valorStr, setValorStr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  const expenseCats = userCategories.length > 0 ? userCategories.map(c => c.nome) : DEFAULT_EXPENSE_CATEGORIES
  const incomeCats = DEFAULT_INCOME_CATEGORIES
  const cats = form.tipo === 'Despesa' ? expenseCats : incomeCats

  const load = useCallback(async () => {
    const res = await getRecurring()
    setItems(res.data)
  }, [])

  useEffect(() => {
    load()
    getCategories().then(r => setUserCategories(r.data)).catch(() => {})
  }, [load])

  const filtered = tab === 'todas' ? items : tab === 'despesas' ? items.filter(i => i.tipo === 'Despesa') : items.filter(i => i.tipo === 'Receita')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload: CreateRecurringPayload = {
        ...form,
        valor: parseFloat(valorStr) || 0,
        tipoReceita: form.tipo === 'Receita' ? form.tipoReceita : null,
      }
      await createRecurring(payload)
      setForm(initialForm)
      setValorStr('')
      setShowForm(false)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erro ao criar lançamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar este lançamento recorrente? As ocorrências já criadas serão mantidas.')) return
    await deleteRecurring(id)
    load()
  }

  const handleRun = async (id: string) => {
    setRunningId(id)
    try {
      const res = await runRecurring(id)
      await load()
      alert(`${res.data.ocorrenciasCriadas} ocorrência(s) criada(s).`)
    } finally {
      setRunningId(null)
    }
  }

  const handleToggleAtivo = async (item: RecurringTransaction) => {
    await updateRecurring(item.id, {
      descricao: item.descricao,
      categoria: item.categoria,
      valor: item.valor,
      frequencia: item.frequencia,
      diaCobranca: item.diaCobranca,
      dataFim: item.dataFim,
      tipoReceita: item.tipoReceita,
      ativo: !item.ativo,
    })
    load()
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"

  // Preview próximas ocorrências enquanto preenche
  const previewOccurrences = (() => {
    const valor = parseFloat(valorStr) || 0
    if (!valor) return []
    const start = new Date(form.dataInicio + 'T00:00:00')
    const today = new Date()
    const result: string[] = []
    if (form.frequencia === 'Mensal') {
      let y = start.getFullYear()
      let m = start.getMonth()
      while (result.length < 3) {
        const daysInMonth = new Date(y, m + 1, 0).getDate()
        const day = Math.min(form.diaCobranca, daysInMonth)
        const occurrence = new Date(y, m, day)
        if (occurrence >= start && occurrence >= today) result.push(occurrence.toLocaleDateString('pt-BR'))
        m++
        if (m > 11) { m = 0; y++ }
        if (y > start.getFullYear() + 5) break
      }
    } else if (form.frequencia === 'Semanal') {
      let cur = new Date(start)
      while (cur.getDay() !== form.diaCobranca) cur.setDate(cur.getDate() + 1)
      while (result.length < 3) {
        if (cur >= today) result.push(cur.toLocaleDateString('pt-BR'))
        cur.setDate(cur.getDate() + 7)
      }
    } else if (form.frequencia === 'Anual') {
      let y = start.getFullYear()
      while (result.length < 3) {
        const day = Math.min(form.diaCobranca, new Date(y, start.getMonth() + 1, 0).getDate())
        const occurrence = new Date(y, start.getMonth(), day)
        if (occurrence >= start && occurrence >= today) result.push(occurrence.toLocaleDateString('pt-BR'))
        y++
      }
    }
    return result
  })()

  const totalDespesasFixas = items.filter(i => i.tipo === 'Despesa' && i.ativo).reduce((s, i) => s + i.valor, 0)
  const totalReceitasFixas = items.filter(i => i.tipo === 'Receita' && i.ativo).reduce((s, i) => s + i.valor, 0)

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Lançamentos Fixos</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Cadastre uma vez, deixe o sistema criar todo mês</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          {showForm ? 'Fechar' : 'Novo Lançamento'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4">
          <p className="text-[11px] text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider">Total fixo / mês</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{fmt(totalReceitasFixas - totalDespesasFixas)}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4">
          <p className="text-[11px] text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider">Despesas fixas</p>
          <p className="text-xl font-bold text-red-500 mt-1 flex items-center gap-1.5"><TrendingDown size={16}/>{fmt(totalDespesasFixas)}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider">Receitas fixas</p>
          <p className="text-xl font-bold text-emerald-500 mt-1 flex items-center gap-1.5"><TrendingUp size={16}/>{fmt(totalReceitasFixas)}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Repeat size={16} className="text-emerald-500" /> Novo Lançamento Recorrente
          </h3>
          {error && <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo toggle */}
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...form, tipo: 'Despesa', categoria: expenseCats[0] || 'Casa' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${form.tipo === 'Despesa' ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-500'}`}>
                <TrendingDown size={14} className="inline mr-1.5" /> Despesa
              </button>
              <button type="button" onClick={() => setForm({ ...form, tipo: 'Receita', categoria: incomeCats[0] || 'Salário' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${form.tipo === 'Receita' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-500'}`}>
                <TrendingUp size={14} className="inline mr-1.5" /> Receita
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><FileText size={11}/> Descrição</label>
                <input className={inputClass} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Aluguel, Salário..." required />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><DollarSign size={11}/> Valor</label>
                <input className={inputClass} type="number" step="0.01" min="0.01" value={valorStr} onChange={e => setValorStr(e.target.value)} placeholder="0,00" required />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Tag size={11}/> Categoria</label>
                <select className={inputClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Repeat size={11}/> Frequência</label>
                <select className={inputClass} value={form.frequencia} onChange={e => setForm({ ...form, frequencia: e.target.value as any, diaCobranca: e.target.value === 'Semanal' ? 1 : 5 })}>
                  <option value="Mensal">Mensal</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Calendar size={11}/>
                  {form.frequencia === 'Mensal' ? 'Dia do mês' : form.frequencia === 'Semanal' ? 'Dia da semana' : 'Dia (mês de início)'}
                </label>
                {form.frequencia === 'Semanal' ? (
                  <select className={inputClass} value={form.diaCobranca} onChange={e => setForm({ ...form, diaCobranca: parseInt(e.target.value) })}>
                    {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                ) : (
                  <input className={inputClass} type="number" min="1" max="31" value={form.diaCobranca} onChange={e => setForm({ ...form, diaCobranca: parseInt(e.target.value) || 1 })} required />
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Calendar size={11}/> Data início</label>
                <input className={inputClass} type="date" value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })} required />
              </div>
              {form.tipo === 'Receita' && (
                <div>
                  <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Tag size={11}/> Tipo de receita</label>
                  <select className={inputClass} value={form.tipoReceita || 'Fixa'} onChange={e => setForm({ ...form, tipoReceita: e.target.value as any })}>
                    <option value="Fixa">Fixa</option>
                    <option value="Variavel">Variável</option>
                  </select>
                </div>
              )}
            </div>

            {previewOccurrences.length > 0 && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3">
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Próximas 3 ocorrências:</p>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">{previewOccurrences.join(' · ')}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                {submitting ? 'Criando...' : 'Criar Lançamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-white/5">
        {(['todas', 'despesas', 'receitas'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white'}`}>
            {t === 'todas' ? 'Todas' : t === 'despesas' ? 'Despesas' : 'Receitas'}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
          <Repeat size={36} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum lançamento recorrente cadastrado.</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Crie um para automatizar suas despesas e receitas mensais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => (
            <div key={item.id} className={`rounded-xl bg-white dark:bg-[#0A0A0C] border p-4 transition-all ${item.ativo ? 'border-gray-200 dark:border-white/10' : 'border-gray-200 dark:border-white/5 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.tipo === 'Despesa' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {item.tipo === 'Despesa' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.descricao}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-500">{item.categoria}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.ativo ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}>
                  {item.ativo ? 'Ativo' : 'Pausado'}
                </span>
              </div>

              <div className="space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Valor</span>
                  <span className={`font-bold ${item.tipo === 'Despesa' ? 'text-red-500' : 'text-emerald-500'}`}>{fmt(item.valor)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Frequência</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {FREQ_LABELS[item.frequencia]}
                    {item.frequencia === 'Mensal' && ` · dia ${item.diaCobranca}`}
                    {item.frequencia === 'Semanal' && ` · ${WEEKDAYS[item.diaCobranca]}`}
                    {item.frequencia === 'Anual' && ` · dia ${item.diaCobranca}`}
                  </span>
                </div>
                {item.ultimaGeracao && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Última geração</span>
                    <span className="text-gray-700 dark:text-gray-300">{new Date(item.ultimaGeracao).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <button onClick={() => handleRun(item.id)} disabled={runningId === item.id || !item.ativo}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors disabled:opacity-50">
                  <RefreshCw size={12} className={runningId === item.id ? 'animate-spin' : ''} /> Gerar
                </button>
                <button onClick={() => handleToggleAtivo(item)} title={item.ativo ? 'Pausar' : 'Ativar'}
                  className="inline-flex items-center justify-center px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
                  {item.ativo ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button onClick={() => handleDelete(item.id)} title="Desativar"
                  className="inline-flex items-center justify-center px-2 py-1.5 text-[11px] font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
