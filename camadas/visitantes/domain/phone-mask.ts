/**
 * Máscara de telefone celular brasileiro: (xx) x xxxxxxxx — DDD (2) + nono
 * dígito (1) + número (8) = 11 dígitos. Domínio puro e testável.
 */

const PHONE_DIGITS = 11

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGITS)
}

/** Reformata progressivamente conforme os dígitos chegam (funciona para apagar também). */
export function maskPhone(value: string): string {
  const digits = digitsOnly(value)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length === 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`
}

export function isCompletePhone(value: string): boolean {
  return digitsOnly(value).length === PHONE_DIGITS
}
