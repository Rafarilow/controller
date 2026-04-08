import api from './client'
import type { Account, AccountTipo } from '../types'

export interface CreateAccountPayload {
  nome: string
  tipo: AccountTipo
  saldoInicial: number
  cor: string
}

export interface UpdateAccountPayload extends CreateAccountPayload {
  ativo: boolean
}

export const getAccounts = () => api.get<Account[]>('/accounts')
export const createAccount = (data: CreateAccountPayload) => api.post<Account>('/accounts', data)
export const updateAccount = (id: string, data: UpdateAccountPayload) => api.put<Account>(`/accounts/${id}`, data)
export const deleteAccount = (id: string) => api.delete(`/accounts/${id}`)
