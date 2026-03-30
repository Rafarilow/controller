export interface User {
  id: string
  nome: string
  email: string
}

export interface Expense {
  id: string
  data: string
  descricao: string
  categoria: string
  valor: number
  createdAt: string
}

export interface Receita {
  id: string
  data: string
  descricao: string
  categoria: string
  valor: number
  tipo: 'Fixa' | 'Variavel'
  createdAt: string
}

export interface UserCategory {
  id: string
  nome: string
}

export interface CategoryReport {
  categoria: string
  total: number
}

export interface MonthReport {
  mes: string
  total: number
}

export interface ReportData {
  byCategory: CategoryReport[]
  byMonth: MonthReport[]
  total: number
  average: number
  totalReceitas: number
  saldo: number
  receitasByMonth: MonthReport[]
}

export interface AuthResponse {
  token: string
  user: User
}
