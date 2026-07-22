/**
 * Traduz erros de autenticação do Supabase em uma chave i18n amigável.
 * Baseado no `code` estável do @supabase/auth-js (não no texto da mensagem,
 * que muda entre versões/locales do serviço). Função pura e testável.
 */

export interface AuthErrorInfo {
  message?: string
  status?: number
  code?: string
}

export const AUTH_ERROR_KEYS = [
  'rateLimited',
  'weakPassword',
  'invalidCredentials',
  'emailExists',
  'emailInvalid',
  'signupDisabled',
  'generic'
] as const

export type AuthErrorKey = (typeof AUTH_ERROR_KEYS)[number]

const KEY_BY_CODE: Record<string, AuthErrorKey> = {
  over_email_send_rate_limit: 'rateLimited',
  over_request_rate_limit: 'rateLimited',
  over_sms_send_rate_limit: 'rateLimited',
  weak_password: 'weakPassword',
  invalid_credentials: 'invalidCredentials',
  email_exists: 'emailExists',
  user_already_exists: 'emailExists',
  identity_already_exists: 'emailExists',
  email_address_invalid: 'emailInvalid',
  signup_disabled: 'signupDisabled',
  email_provider_disabled: 'signupDisabled'
}

export function mapAuthError(error: AuthErrorInfo): AuthErrorKey {
  if (error.code && KEY_BY_CODE[error.code]) return KEY_BY_CODE[error.code]
  if (error.status === 429) return 'rateLimited'
  return 'generic'
}
