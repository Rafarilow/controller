import api from './client'
import type { RecurringTransaction } from '../types'

export interface CreateRecurringPayload {
  tipo: 'Despesa' | 'Receita'
  descricao: string
  categoria: string
  valor: number
  frequencia: 'Mensal' | 'Semanal' | 'Anual'
  diaCobranca: number
  dataInicio: string
  dataFim?: string | null
  tipoReceita?: 'Fixa' | 'Variavel' | null
}

export interface UpdateRecurringPayload {
  descricao: string
  categoria: string
  valor: number
  frequencia: 'Mensal' | 'Semanal' | 'Anual'
  diaCobranca: number
  dataFim?: string | null
  tipoReceita?: 'Fixa' | 'Variavel' | null
  ativo: boolean
}

export const getRecurring = (ativo?: boolean) =>
  api.get<RecurringTransaction[]>('/recurring', { params: ativo === undefined ? {} : { ativo } })

export const createRecurring = (data: CreateRecurringPayload) =>
  api.post<RecurringTransaction>('/recurring', data)

export const updateRecurring = (id: string, data: UpdateRecurringPayload) =>
  api.put<RecurringTransaction>(`/recurring/${id}`, data)

export const deleteRecurring = (id: string) =>
  api.delete(`/recurring/${id}`)

export const runRecurring = (id: string) =>
  api.post<{ ocorrenciasCriadas: number }>(`/recurring/${id}/run`)
