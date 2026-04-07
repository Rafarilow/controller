import api from './client'
import type { AuthResponse, User } from '../types'

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })

export const register = (nome: string, email: string, password: string) =>
  api.post('/auth/register', { nome, email, password })

export const getMe = () =>
  api.get<User>('/auth/me')

export const updateProfile = (nome: string) =>
  api.put<User>('/auth/me', { nome })

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/auth/password', { currentPassword, newPassword })

export const forgotPassword = (email: string) =>
  api.post<{ token: string; message: string }>('/auth/forgot-password', { email })

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword })
