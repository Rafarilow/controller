import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export interface PeriodRange {
  from?: string
  to?: string
  label: string
}

const now = new Date()
const y = now.getFullYear()
const m = now.getMonth()

const PRESETS: PeriodRange[] = [
  { label: 'Este mês', from: `${y}-${String(m + 1).padStart(2, '0')}-01`, to: `${y}-${String(m + 1).padStart(2, '0')}-${new Date(y, m + 1, 0).getDate()}` },
  { label: 'Mês passado', from: `${m === 0 ? y - 1 : y}-${String(m === 0 ? 12 : m).padStart(2, '0')}-01`, to: `${m === 0 ? y - 1 : y}-${String(m === 0 ? 12 : m).padStart(2, '0')}-${new Date(m === 0 ? y - 1 : y, m === 0 ? 12 : m, 0).getDate()}` },
  { label: 'Últimos 3 meses', from: new Date(y, m - 2, 1).toISOString().slice(0, 10), to: `${y}-${String(m + 1).padStart(2, '0')}-${new Date(y, m + 1, 0).getDate()}` },
  { label: 'Últimos 6 meses', from: new Date(y, m - 5, 1).toISOString().slice(0, 10), to: `${y}-${String(m + 1).padStart(2, '0')}-${new Date(y, m + 1, 0).getDate()}` },
  { label: 'Este ano', from: `${y}-01-01`, to: `${y}-12-31` },
  { label: 'Ano passado', from: `${y - 1}-01-01`, to: `${y - 1}-12-31` },
  { label: 'Tudo', from: undefined, to: undefined },
]

interface Props {
  value: PeriodRange
  onChange: (range: PeriodRange) => void
}

export default function PeriodFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const handlePreset = (preset: PeriodRange) => {
    onChange(preset)
    setOpen(false)
    setCustom(false)
  }

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo, label: `${customFrom} a ${customTo}` })
      setOpen(false)
      setCustom(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:border-gray-300 dark:hover:border-white/20 transition-all"
      >
        <Calendar size={13} />
        <span>{value.label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setCustom(false) }} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="py-1">
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${value.label === preset.label ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-white/5 p-3">
              {!custom ? (
                <button onClick={() => setCustom(true)} className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Período personalizado...
                </button>
              ) : (
                <div className="space-y-2">
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                  <button onClick={handleCustomApply} className="w-full py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { PRESETS }
