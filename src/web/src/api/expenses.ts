import api from './client'
import type { Expense, Receita, UserCategory, ReportData } from '../types'

interface DateFilter {
  from?: string
  to?: string
}

const params = (f?: DateFilter) => {
  const p: Record<string, string> = {}
  if (f?.from) p.from = f.from
  if (f?.to) p.to = f.to
  return { params: p }
}

// Expenses
export const getExpenses = (filter?: DateFilter) =>
  api.get<Expense[]>('/expenses', params(filter))

export const createExpense = (data: { data: string; descricao: string; categoria: string; valor: number }) =>
  api.post<Expense>('/expenses', data)

export const updateExpense = (id: string, data: { data: string; descricao: string; categoria: string; valor: number }) =>
  api.put<Expense>(`/expenses/${id}`, data)

export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`)

export const getReport = (filter?: DateFilter) =>
  api.get<ReportData>('/expenses/report', params(filter))

export const exportPdf = async (filter?: DateFilter) => {
  const response = await api.get('/expenses/export-pdf', { ...params(filter), responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'relatorio_despesas.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
}

// Receitas (Income)
export const getReceitas = (filter?: DateFilter) =>
  api.get<Receita[]>('/receitas', params(filter))

export const createReceita = (data: { data: string; descricao: string; categoria: string; valor: number; tipo: string }) =>
  api.post<Receita>('/receitas', data)

export const updateReceita = (id: string, data: { data: string; descricao: string; categoria: string; valor: number; tipo: string }) =>
  api.put<Receita>(`/receitas/${id}`, data)

export const deleteReceita = (id: string) =>
  api.delete(`/receitas/${id}`)

// Categories
export const getCategories = () =>
  api.get<UserCategory[]>('/categories')

export const createCategory = (nome: string) =>
  api.post<UserCategory>('/categories', { nome })

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`)
