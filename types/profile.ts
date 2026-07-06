export const USER_ROLES = ['admin', 'lider', 'padrinho', 'recepcionista'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface Profile {
  id: string
  nome: string
  telefone: string | null
  role: UserRole
  pgId: string | null
  createdAt: string
}
