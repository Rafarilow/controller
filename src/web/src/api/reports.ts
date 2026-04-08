import api from './client'
import type { CashflowResponse, ProjectionResponse, CalendarResponse } from '../types'

export const getCashflow = (months = 12) =>
  api.get<CashflowResponse>('/reports/cashflow', { params: { months } })

export const getProjection = () =>
  api.get<ProjectionResponse>('/reports/projection')

export const getCalendar = (year: number, month: number) =>
  api.get<CalendarResponse>('/calendar', { params: { year, month } })
