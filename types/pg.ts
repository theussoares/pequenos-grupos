export interface Pg {
  id: string
  nome: string
  diaSemana: number
  horario: string | null
  endereco: string | null
  liderId: string | null
  ativo: boolean
  createdAt: string
}
