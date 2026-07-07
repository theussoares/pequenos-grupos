import { describe, expect, it } from 'vitest'
import { digitsOnly, isCompletePhone, maskPhone } from '../domain/phone-mask'

describe('digitsOnly', () => {
  it('strips non-digit characters', () => {
    expect(digitsOnly('(11) 9 88887777')).toBe('11988887777')
  })

  it('caps at 11 digits', () => {
    expect(digitsOnly('119888877779999')).toBe('11988887777')
  })
})

describe('maskPhone', () => {
  it('formats progressively as digits arrive', () => {
    expect(maskPhone('')).toBe('')
    expect(maskPhone('1')).toBe('(1')
    expect(maskPhone('11')).toBe('(11')
    expect(maskPhone('119')).toBe('(11) 9')
    expect(maskPhone('1198')).toBe('(11) 9 8')
    expect(maskPhone('11988887777')).toBe('(11) 9 88887777')
  })

  it('ignores non-digit characters already in the input', () => {
    expect(maskPhone('(11) 9 88887777')).toBe('(11) 9 88887777')
  })

  it('never grows past 11 digits', () => {
    expect(maskPhone('119888877779999')).toBe('(11) 9 88887777')
  })
})

describe('isCompletePhone', () => {
  it('is true only with exactly 11 digits', () => {
    expect(isCompletePhone('(11) 9 88887777')).toBe(true)
    expect(isCompletePhone('11988887777')).toBe(true)
    expect(isCompletePhone('(11) 9 8888777')).toBe(false)
    expect(isCompletePhone('')).toBe(false)
  })
})
