/**
 * Tipo `Database` no formato esperado pelo @nuxtjs/supabase, derivado das linhas
 * declaradas em `database.ts`. Tipar o client evita payloads inferidos como
 * `never` em insert/update.
 */
import type {
  InteractionRow,
  PgPresenceRow,
  PgRow,
  ProfileRow,
  VisitorRow
} from './database'

interface Table<Row> {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      visitantes: Table<VisitorRow>
      interacoes: Table<InteractionRow>
      pgs: Table<PgRow>
      profiles: Table<ProfileRow>
      presencas_pg: Table<PgPresenceRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
