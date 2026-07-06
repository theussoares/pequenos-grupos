/**
 * Construção de links wa.me com template preenchido (§2.6 "botão de WhatsApp").
 * Domínio puro e testável.
 */

const DEFAULT_COUNTRY_CODE = '55'

/** Remove máscara e garante código do país (Brasil por padrão). */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) return digits
  return `${DEFAULT_COUNTRY_CODE}${digits}`
}

/** Monta a URL wa.me; retorna `null` quando não há telefone utilizável. */
export function buildWhatsappUrl(
  rawPhone: string | null,
  message: string
): string | null {
  if (!rawPhone) return null

  const phone = normalizePhone(rawPhone)
  if (!phone) return null

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
