import { useState, useEffect } from 'react'
import { getCategories, createCategory, deleteCategory } from '../api/expenses'
import type { UserCategory } from '../types'
import { Plus, Trash2, Tag, Settings, Info, Palette } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Casa', 'Roupas', 'Outros']

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444',
  '#22c55e', '#0ea5e9', '#9333ea', '#f59e0b', '#ec4899',
]

export default function ConfiguracoesPage() {
  const { darkMode, toggleTheme } = useTheme()
  const [categories, setCategories] = useState<UserCategory[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const loadCategories = () => {
    getCategories()
      .then(res => setCategories(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCategories() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    setAdding(true)
    try {
      await createCategory(newCategory.trim())
      setNewCategory('')
      loadCategories()
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteCategory(id)
    loadCategories()
  }

  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map((nome, i) => ({ id: `default-${i}`, nome }))
  const isUsingDefaults = categories.length === 0

  return (
    <div className="space-y-6 animate-fade-in pt-2 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações</h1>
        <p className="text-gray-400 dark:text-gray-500 mt-1 text-[13px] font-medium">Personalize a plataforma conforme suas necessidades</p>
      </div>

      {/* Categories Section */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Tag size={16} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Categorias de Despesas</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Gerencie as categorias disponíveis para suas despesas</p>
            </div>
          </div>
        </div>

        {isUsingDefaults && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Você está usando as categorias padrão. Adicione suas próprias categorias para personalizá-las — ao fazer isso, as padrão serão substituídas pelas suas.
              </p>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Add category form */}
          <form onSubmit={handleAdd} className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Nome da nova categoria..."
                maxLength={50}
                className="w-full px-3 py-2.5 pl-9 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newCategory.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              <Plus size={15} /> Adicionar
            </button>
          </form>

          {/* Category list */}
          {loading ? (
            <div className="py-8 text-center text-gray-400 dark:text-gray-600 text-sm">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayCategories.map((cat, i) => (
                <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 group hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.nome}</span>
                    {isUsingDefaults && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">padrão</span>
                    )}
                  </div>
                  {!isUsingDefaults && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appearance Section */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Palette size={16} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Aparência</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Personalize a visualização da plataforma</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Modo Escuro</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Alternar entre tema claro e escuro</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${darkMode ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-xl bg-white dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Settings size={16} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Sobre</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Informações sobre a plataforma</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-white/5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Versão</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-white/5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Plataforma</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Controller Finance</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Backend</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">.NET 10 + PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
