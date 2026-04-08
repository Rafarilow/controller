import api from './client'
import type { Goal } from '../types'

export interface GoalPayload {
  nome: string
  valorAlvo: number
  dataAlvo?: string | null
  cor: string
  descricao?: string | null
}

export const getGoals = () => api.get<Goal[]>('/goals')
export const createGoal = (data: GoalPayload) => api.post<Goal>('/goals', data)
export const updateGoal = (id: string, data: GoalPayload) => api.put<Goal>(`/goals/${id}`, data)
export const contribuirGoal = (id: string, valor: number) => api.post<Goal>(`/goals/${id}/contribuir`, { valor })
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`)
