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
  origemRecorrenteId?: string | null
}

export interface Receita {
  id: string
  data: string
  descricao: string
  categoria: string
  valor: number
  tipo: 'Fixa' | 'Variavel'
  createdAt: string
  origemRecorrenteId?: string | null
}

export interface RecurringTransaction {
  id: string
  tipo: 'Despesa' | 'Receita'
  descricao: string
  categoria: string
  valor: number
  frequencia: 'Mensal' | 'Semanal' | 'Anual'
  diaCobranca: number
  dataInicio: string
  dataFim?: string | null
  ativo: boolean
  ultimaGeracao?: string | null
  tipoReceita?: 'Fixa' | 'Variavel' | null
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

export interface Budget {
  id: string
  categoria: string
  valorLimite: number
  periodo: string
  gastoAtual: number
  percentual: number
  status: 'ok' | 'alerta' | 'estourado'
  createdAt: string
}

export type AccountTipo = 'ContaCorrente' | 'Poupanca' | 'Cartao' | 'Dinheiro' | 'Investimento'

export interface Account {
  id: string
  nome: string
  tipo: AccountTipo
  saldoInicial: number
  cor: string
  ativo: boolean
  saldoAtual: number
  createdAt: string
}

export interface Goal {
  id: string
  nome: string
  valorAlvo: number
  valorAtual: number
  dataAlvo?: string | null
  cor: string
  descricao?: string | null
  percentual: number
  createdAt: string
}

export interface CashflowMonth {
  mes: string
  receitas: number
  despesas: number
  saldo: number
}

export interface CashflowResponse {
  items: CashflowMonth[]
}

export interface ProjectionResponse {
  receitaPrevista: number
  despesaPrevista: number
  saldoPrevisto: number
  lancamentosAtivos: number
}

export interface CalendarItem {
  data: string
  tipo: 'Despesa' | 'Receita'
  descricao: string
  categoria: string
  valor: number
  status: 'pago' | 'previsto'
}

export interface CalendarResponse {
  items: CalendarItem[]
  mes: string
}
