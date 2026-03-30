import { useState, useEffect, useCallback } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { getReport, exportPdf } from '../api/expenses'
import { Download, TrendingUp, TrendingDown, PieChart, Wallet, Calendar, ArrowUpRight } from 'lucide-react'
import type { ReportData } from '../types'
import PeriodFilter, { PRESETS, type PeriodRange } from '../components/PeriodFilter'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#22c55e', '#0ea5e9', '#9333ea']

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [period, setPeriod] = useState<PeriodRange>(PRESETS[6]) // "Tudo" default for reports

  const loadReport = useCallback(() => {
    getReport({ from: period.from, to: period.to }).then(res => setReport(res.data))
  }, [period])

  useEffect(() => { loadReport() }, [loadReport])

  if (!report) return <div className="text-center py-20 text-gray-400 dark:text-gray-600">Carregando...</div>

  const biggest = report.byCategory.length > 0
    ? report.byCategory.reduce((a, b) => a.total > b.total ? a : b).categoria
    : 'Nenhuma'

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const periodo = !period.from && !period.to ? 'Tudo' : period.label

  // Combined monthly chart data
  const allMonths = Array.from(new Set([
    ...report.byMonth.map(m => m.mes),
    ...report.receitasByMonth.map(m => m.mes),
  ])).sort()

  const expensesByMonthMap = Object.fromEntries(report.byMonth.map(m => [m.mes, m.total]))
  const receitasByMonthMap = Object.fromEntries(report.receitasByMonth.map(m => [m.mes, m.total]))

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Relatórios</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          <button onClick={() => exportPdf({ from: period.from, to: period.to })} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Stats - 6 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Receitas - highlighted green */}
        <div className="lg:col-span-1 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400/30 shadow-lg text-white relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1">
            <ArrowUpRight size={11} /> Receitas
          </div>
          <p className="text-base sm:text-xl font-bold tracking-tight relative z-10">{fmt(report.totalReceitas)}</p>
        </div>

        {/* Despesas */}
        <div className="lg:col-span-1 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingDown size={64} /></div>
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Despesas</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">{fmt(report.total)}</p>
        </div>

        {/* Saldo */}
        <div className={`lg:col-span-1 p-4 sm:p-5 rounded-xl border shadow-sm transition-all relative overflow-hidden group ${report.saldo >= 0 ? 'bg-white dark:bg-[#0A0A0C] border-gray-200 dark:border-white/10' : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'}`}>
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={64} /></div>
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Saldo</p>
          <p className={`text-base sm:text-xl font-bold tracking-tight ${report.saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmt(report.saldo)}</p>
        </div>

        {/* Average */}
        <div className="lg:col-span-1 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity"><PieChart size={64} /></div>
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Média/Cat.</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">{fmt(report.average)}</p>
        </div>

        {/* Biggest */}
        <div className="lg:col-span-1 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={64} /></div>
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Maior Cat.</p>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight truncate">{biggest}</p>
        </div>

        {/* Period */}
        <div className="lg:col-span-1 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar size={64} /></div>
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Período</p>
          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate capitalize">{periodo}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Bar chart - Receitas vs Despesas */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#101018] border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Receitas vs Despesas</h3>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Comparativo mensal</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-500 dark:text-gray-400">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-500 dark:text-gray-400">Despesas</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] sm:h-[280px]">
            {allMonths.length > 0 ? (
              <Bar data={{
                labels: allMonths.map(m => {
                  const [y, mo] = m.split('-').map(Number)
                  return new Date(y, mo - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
                }),
                datasets: [
                  {
                    label: 'Receitas',
                    data: allMonths.map(m => receitasByMonthMap[m] || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    hoverBackgroundColor: '#10b981',
                    borderRadius: 6,
                    barThickness: allMonths.length > 6 ? 16 : 28,
                  },
                  {
                    label: 'Despesas',
                    data: allMonths.map(m => expensesByMonthMap[m] || 0),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    hoverBackgroundColor: '#ef4444',
                    borderRadius: 6,
                    barThickness: allMonths.length > 6 ? 16 : 28,
                  }
                ]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(128,128,128,0.06)' },
                    ticks: { font: { size: 11 }, color: '#9ca3af' },
                    border: { display: false }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: 'bold' as const }, color: '#9ca3af' },
                    border: { display: false }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { backgroundColor: '#1a1a24', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { size: 12 }, bodyFont: { size: 11 } }
                }
              }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                Sem dados para o período selecionado
              </div>
            )}
          </div>
        </div>

        {/* Doughnut - smaller side */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#101018] border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Categorias</h3>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Distribuição de gastos</p>
          </div>
          {report.byCategory.length > 0 ? (
            <>
              <div className="max-w-[180px] mx-auto mb-4">
                <Doughnut data={{
                  labels: report.byCategory.map(c => c.categoria),
                  datasets: [{ data: report.byCategory.map(c => c.total), backgroundColor: CHART_COLORS, borderWidth: 0 }]
                }} options={{
                  cutout: '70%',
                  plugins: { legend: { display: false } }
                }} />
              </div>
              <div className="space-y-2 mt-4">
                {report.byCategory.map((cat, i) => (
                  <div key={cat.categoria} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate max-w-[100px]">{cat.categoria}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{fmt(cat.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
              Sem despesas no período
            </div>
          )}
        </div>
      </div>

      {/* Balance summary */}
      {(report.total > 0 || report.totalReceitas > 0) && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#101018] border border-gray-200 dark:border-white/10 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Resumo Financeiro</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total de Receitas</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{fmt(report.totalReceitas)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total de Despesas</span>
              </div>
              <span className="text-sm font-semibold text-red-500">-{fmt(report.total)}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Saldo do Período</span>
              <span className={`text-sm font-bold ${report.saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {report.saldo >= 0 ? '+' : ''}{fmt(report.saldo)}
              </span>
            </div>
            {report.totalReceitas > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-600 mb-1">
                  <span>Taxa de poupança</span>
                  <span>{Math.max(0, Math.round((report.saldo / report.totalReceitas) * 100))}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${report.saldo >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.max(0, (report.saldo / report.totalReceitas) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
