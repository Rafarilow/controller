import { useState, useEffect, useCallback } from 'react'
import { getCalendar } from '../api/reports'
import type { CalendarItem } from '../types'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, TrendingUp, TrendingDown, Clock } from 'lucide-react'

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CalendarioPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-12
  const [items, setItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCalendar(year, month)
      setItems(res.data.items)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { load() }, [load])

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1) } else setMonth(month - 1)
  }
  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(year + 1) } else setMonth(month + 1)
  }
  const goToday = () => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()) }

  // Group items by date (YYYY-MM-DD)
  const byDate: Record<string, CalendarItem[]> = {}
  items.forEach(it => {
    if (!byDate[it.data]) byDate[it.data] = []
    byDate[it.data].push(it)
  })

  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  const startOffset = firstDayOfMonth.getDay() // 0 = Domingo
  const totalDays = lastDayOfMonth.getDate()

  // Build grid: 6 weeks x 7 days = 42 cells
  const cells: Array<{ day: number; date: string } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr })
  }
  while (cells.length < 42) cells.push(null)

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const isToday = (date: string) => {
    const t = today.toISOString().slice(0, 10)
    return date === t
  }

  const totalReceitas = items.filter(i => i.tipo === 'Receita').reduce((s, i) => s + i.valor, 0)
  const totalDespesas = items.filter(i => i.tipo === 'Despesa').reduce((s, i) => s + i.valor, 0)
  const totalPrevistos = items.filter(i => i.status === 'previsto').length

  const selectedItems = selectedDay ? byDate[selectedDay] || [] : []

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Calendário</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Visualize seus vencimentos e lançamentos do mês</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white flex items-center justify-center"><ChevronLeft size={16}/></button>
          <button onClick={goToday} className="px-3 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">Hoje</button>
          <button onClick={goNext} className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white flex items-center justify-center"><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Mês</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{MONTH_NAMES[month - 1]} {year}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Receitas</p>
          <p className="text-lg font-bold text-emerald-500 mt-1 flex items-center gap-1.5"><TrendingUp size={14}/>{fmt(totalReceitas)}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Despesas</p>
          <p className="text-lg font-bold text-red-500 mt-1 flex items-center gap-1.5"><TrendingDown size={14}/>{fmt(totalDespesas)}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 p-4">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Previstos</p>
          <p className="text-lg font-bold text-blue-500 mt-1 flex items-center gap-1.5"><Clock size={14}/>{totalPrevistos}</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/5">
          {WEEKDAYS_SHORT.map(d => (
            <div key={d} className="px-2 py-2.5 text-center text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={idx} className="h-20 sm:h-24 border-r border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]" />
            const dayItems = byDate[cell.date] || []
            const hasReceita = dayItems.some(i => i.tipo === 'Receita')
            const hasDespesa = dayItems.some(i => i.tipo === 'Despesa')
            const hasPrevisto = dayItems.some(i => i.status === 'previsto')
            const isCurrentDay = isToday(cell.date)
            return (
              <button key={idx} onClick={() => setSelectedDay(cell.date)}
                className={`h-20 sm:h-24 border-r border-b border-gray-100 dark:border-white/5 p-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex flex-col ${isCurrentDay ? 'bg-emerald-50/40 dark:bg-emerald-500/5' : ''}`}>
                <div className={`text-[12px] font-semibold ${isCurrentDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{cell.day}</div>
                <div className="flex-1 mt-1 flex flex-wrap gap-0.5 content-start">
                  {hasReceita && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Receita"/>}
                  {hasDespesa && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Despesa"/>}
                  {hasPrevisto && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Previsto"/>}
                </div>
                {dayItems.length > 0 && (
                  <div className="text-[10px] text-gray-500 truncate mt-auto">{dayItems.length} item{dayItems.length > 1 ? 's' : ''}</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {loading && <p className="text-center text-sm text-gray-400">Carregando...</p>}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Receita</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"/> Despesa</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"/> Previsto</span>
      </div>

      {/* Detail modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-emerald-500" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{new Date(selectedDay + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white"><X size={18}/></button>
            </div>
            {selectedItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhum lançamento neste dia.</p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${it.tipo === 'Despesa' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {it.tipo === 'Despesa' ? <TrendingDown size={16}/> : <TrendingUp size={16}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.descricao}</p>
                      <p className="text-[11px] text-gray-500">{it.categoria} · {it.status === 'previsto' ? 'Previsto' : 'Lançado'}</p>
                    </div>
                    <p className={`text-sm font-bold ${it.tipo === 'Despesa' ? 'text-red-500' : 'text-emerald-500'}`}>{fmt(it.valor)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
