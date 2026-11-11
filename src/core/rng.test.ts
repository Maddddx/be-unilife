import { describe, expect, it } from 'vitest'
import { createRng, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('shuffle keeps all items', () => {
    expect(shuffle([1, 2, 3, 4, 5], createRng(1)).sort()).toEqual([1, 2, 3, 4, 5])
  })
})
