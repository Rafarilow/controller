import api from './client'
import type { Budget } from '../types'

export interface BudgetPayload {
  categoria: string
  valorLimite: number
  periodo: string
}

export const getBudgets = () => api.get<Budget[]>('/budgets')
export const createBudget = (data: BudgetPayload) => api.post<Budget>('/budgets', data)
export const updateBudget = (id: string, data: BudgetPayload) => api.put<Budget>(`/budgets/${id}`, data)
export const deleteBudget = (id: string) => api.delete(`/budgets/${id}`)
