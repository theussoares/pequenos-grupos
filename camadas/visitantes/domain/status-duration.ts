/**
 * Tempo de permanência no status atual, para o card do Kanban (§2.6).
 * Domínio puro.
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** Dias inteiros decorridos desde a entrada no status atual (mínimo 0). */
export function daysInStatus(statusChangedAt: Date, now: Date): number {
  const elapsed = now.getTime() - statusChangedAt.getTime()
  if (elapsed <= 0) return 0
  return Math.floor(elapsed / DAY_MS)
}
