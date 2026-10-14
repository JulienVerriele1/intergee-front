import { describe, expect, it } from 'vitest'
import { presentationError, presentationLength } from '@/profile/presentation'

describe('presentation', () => {
  it('counts characters without the spaces around, an emoji as one', () => {
    expect(presentationLength('  abc  ')).toBe(3)
    expect(presentationLength('🙂🙂')).toBe(2)
    expect(presentationLength(null)).toBe(0)
  })

  it('accepts 300 to 1 000 characters', () => {
    expect(presentationError('a'.repeat(300))).toBe('')
    expect(presentationError('a'.repeat(1000))).toBe('')
  })

  it('explains what is missing or too much', () => {
    expect(presentationError('   ')).toBe('Rédigez votre présentation.')
    expect(presentationError('a'.repeat(299))).toBe('Votre présentation doit faire au moins 300 caractères : il en manque 1.')
    expect(presentationError('a'.repeat(1003))).toBe('Votre présentation ne doit pas dépasser 1 000 caractères : retirez-en 3.')
  })
})
