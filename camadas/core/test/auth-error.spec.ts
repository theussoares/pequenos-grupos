import { describe, expect, it } from 'vitest'
import { mapAuthError } from '../utils/auth-error'

describe('mapAuthError', () => {
  it('maps known rate-limit codes to rateLimited', () => {
    expect(mapAuthError({ code: 'over_email_send_rate_limit' })).toBe(
      'rateLimited'
    )
    expect(mapAuthError({ code: 'over_request_rate_limit' })).toBe(
      'rateLimited'
    )
  })

  it('falls back to rateLimited on HTTP 429 even without a known code', () => {
    expect(mapAuthError({ status: 429, message: 'weird future message' })).toBe(
      'rateLimited'
    )
  })

  it('maps weak_password, invalid_credentials and duplicate-email codes', () => {
    expect(mapAuthError({ code: 'weak_password' })).toBe('weakPassword')
    expect(mapAuthError({ code: 'invalid_credentials' })).toBe(
      'invalidCredentials'
    )
    expect(mapAuthError({ code: 'email_exists' })).toBe('emailExists')
    expect(mapAuthError({ code: 'user_already_exists' })).toBe('emailExists')
  })

  it('falls back to generic for unknown codes', () => {
    expect(mapAuthError({ code: 'some_new_error_code' })).toBe('generic')
    expect(mapAuthError({})).toBe('generic')
  })
})
