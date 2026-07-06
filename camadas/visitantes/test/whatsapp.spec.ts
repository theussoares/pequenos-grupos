import { describe, expect, it } from 'vitest'
import { buildWhatsappUrl, normalizePhone } from '../domain/whatsapp'
import {
  firstName,
  whatsappTemplateKey
} from '../domain/whatsapp-template'

describe('normalizePhone', () => {
  it('strips mask and prefixes the country code', () => {
    expect(normalizePhone('(11) 98888-7777')).toBe('5511988887777')
  })

  it('keeps an existing country code', () => {
    expect(normalizePhone('5511988887777')).toBe('5511988887777')
  })

  it('returns empty for a blank phone', () => {
    expect(normalizePhone('   ')).toBe('')
  })
})

describe('buildWhatsappUrl', () => {
  it('returns null without a phone', () => {
    expect(buildWhatsappUrl(null, 'oi')).toBeNull()
  })

  it('builds an encoded wa.me url', () => {
    expect(buildWhatsappUrl('11988887777', 'Oi, João!')).toBe(
      'https://wa.me/5511988887777?text=Oi%2C%20Jo%C3%A3o!'
    )
  })
})

describe('whatsappTemplateKey', () => {
  it('maps status to its message template', () => {
    expect(whatsappTemplateKey('novo')).toBe('whatsapp.templates.welcome')
    expect(whatsappTemplateKey('reativacao')).toBe(
      'whatsapp.templates.reactivation'
    )
    expect(whatsappTemplateKey('integrado')).toBe('whatsapp.templates.generic')
  })
})

describe('firstName', () => {
  it('returns the first token of the full name', () => {
    expect(firstName('João Pedro Silva')).toBe('João')
  })
})
