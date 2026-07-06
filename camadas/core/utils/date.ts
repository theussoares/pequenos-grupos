/** Formatação de datas via Intl. Funções puras — recebem locale explícito. */

export function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso))
}

export function formatDate(iso: string | null, locale: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(iso)
  )
}

/** Rótulo relativo curto ("em 3h", "há 2 dias"). */
export function formatRelativeToNow(
  target: Date | null,
  now: Date,
  locale: string
): string {
  if (!target) return ''
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffMs = target.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (60 * 60 * 1000))

  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour')
  return formatter.format(Math.round(diffHours / 24), 'day')
}
