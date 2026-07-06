/**
 * Conversão entre linhas do banco (snake_case) e tipos de domínio (camelCase).
 * Funções puras — a fronteira anti-corrupção entre Supabase e a aplicação.
 */
import type {
  InteractionRow,
  PgPresenceRow,
  PgRow,
  ProfileRow,
  VisitorRow
} from '~/types/database'
import type { Visitor } from '~/types/visitor'
import type { Interaction } from '~/types/interaction'
import type { Pg } from '~/types/pg'
import type { Profile, UserRole  } from '~/types/profile'
import type { PgPresence } from '~/types/presence'
import { isVisitorStatus, type VisitorStatus } from './visitor-status'
import { isInteractionType } from './interaction-type'

function toStatus(value: string): VisitorStatus {
  return isVisitorStatus(value) ? value : 'novo'
}

export function toVisitor(row: VisitorRow): Visitor {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    idade: row.idade,
    dataPrimeiraVisita: row.data_primeira_visita,
    comoConheceu: row.como_conheceu,
    observacoes: row.observacoes,
    status: toStatus(row.status),
    pgId: row.pg_id,
    padrinhoId: row.padrinho_id,
    cadastradoPor: row.cadastrado_por,
    proximoContatoEm: row.proximo_contato_em,
    ultimoContatoEm: row.ultimo_contato_em,
    amizadeConfirmada: row.amizade_confirmada,
    responsabilidade: row.responsabilidade,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function toInteraction(
  row: InteractionRow,
  autorNome: string | null = null
): Interaction {
  return {
    id: row.id,
    visitanteId: row.visitante_id,
    autorId: row.autor_id,
    autorNome,
    tipo: isInteractionType(row.tipo) ? row.tipo : 'nota',
    descricao: row.descricao,
    statusAnterior: row.status_anterior
      ? toStatus(row.status_anterior)
      : null,
    statusNovo: row.status_novo ? toStatus(row.status_novo) : null,
    createdAt: row.created_at
  }
}

export function toPg(row: PgRow): Pg {
  return {
    id: row.id,
    nome: row.nome,
    diaSemana: row.dia_semana,
    horario: row.horario,
    endereco: row.endereco,
    liderId: row.lider_id,
    ativo: row.ativo,
    createdAt: row.created_at
  }
}

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    role: row.role as UserRole,
    pgId: row.pg_id,
    createdAt: row.created_at
  }
}

export function toPresence(row: PgPresenceRow): PgPresence {
  return {
    id: row.id,
    visitanteId: row.visitante_id,
    pgId: row.pg_id,
    data: row.data,
    registradoPor: row.registrado_por,
    createdAt: row.created_at
  }
}
