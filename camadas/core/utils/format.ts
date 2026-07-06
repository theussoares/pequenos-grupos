/** Formatação de números/datas para métricas. Funções puras (locale explícito). */

export function formatPercent(ratio: number | null, locale: string): string {
  if (ratio === null) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(ratio)
}

/** Converte uma chave 'YYYY-MM' no nome curto do mês do locale. */
export function formatMonthKey(key: string, locale: string): string {
  const [year, month] = key.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(
    new Date(year ?? 1970, (month ?? 1) - 1, 1)
  )
}
