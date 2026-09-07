import { describe, expect, it } from 'vitest'
import { getPart, parts, systems } from '../data/parts'
import { initialState, reducer, visibleParts } from './explorer'

describe('explorer', () => {
  it('starts with all 20 parts visible and no selection', () => {
    expect(visibleParts(initialState)).toHaveLength(20)
    expect(initialState.selectedId).toBeNull()
    expect(initialState.isolatedId).toBeNull()
    expect(initialState.explosion).toBe(0)
    expect(new Set(parts.map((part) => part.id)).size).toBe(20)
    expect(getPart('processor')?.system).toBe('computing')
    expect(getPart('missing')).toBeUndefined()
  })

  it('hides a disabled system and clears its selected part', () => {
    const selected = reducer(initialState, { type: 'select', id: 'left-fan' })
    const filtered = reducer(selected, { type: 'toggle-system', id: 'cooling' })
    expect(filtered.selectedId).toBeNull()
    expect(visibleParts(filtered).some((part) => part.system === 'cooling')).toBe(false)
    expect(visibleParts(reducer(filtered, { type: 'toggle-system', id: 'cooling' }))).toEqual(parts)
  })

  it('keeps selection when toggling a different system', () => {
    const selected = reducer(initialState, { type: 'select', id: 'left-fan' })
    expect(reducer(selected, { type: 'toggle-system', id: 'power' }).selectedId).toBe('left-fan')
  })

  it('rejects unknown and hidden selections without losing the visible selection', () => {
    const filtered = reducer(initialState, { type: 'toggle-system', id: 'power' })
    const selected = reducer(filtered, { type: 'select', id: 'left-fan' })
    expect(reducer(selected, { type: 'select', id: 'missing' }).selectedId).toBe('left-fan')
    expect(reducer(selected, { type: 'select', id: 'magsafe' }).selectedId).toBe('left-fan')
    expect(reducer(selected, { type: 'select', id: null }).selectedId).toBeNull()
  })

  it('isolates the selection and restores the previous filters on exit', () => {
    const filtered = reducer(initialState, { type: 'toggle-system', id: 'power' })
    const selected = reducer(filtered, { type: 'select', id: 'processor' })
    const isolated = reducer(selected, { type: 'isolate' })
    expect(visibleParts(isolated).map((part) => part.id)).toEqual(['processor'])
    expect(isolated.enabledSystems).toEqual(filtered.enabledSystems)
    expect(reducer(isolated, { type: 'select', id: 'left-fan' }).selectedId).toBe('processor')
    expect(visibleParts(reducer(isolated, { type: 'clear-isolation' }))).toEqual(visibleParts(filtered))
  })

  it('does nothing when asked to isolate without a selection', () => {
    expect(reducer(initialState, { type: 'isolate' })).toEqual(initialState)
  })

  it('exits isolation when a system changes and clears a newly hidden selection', () => {
    const selected = reducer(initialState, { type: 'select', id: 'processor' })
    const isolated = reducer(selected, { type: 'isolate' })
    const filtered = reducer(isolated, { type: 'toggle-system', id: 'computing' })
    expect(filtered.isolatedId).toBeNull()
    expect(filtered.selectedId).toBeNull()
    expect(visibleParts(filtered).length).toBeGreaterThan(1)
    expect(visibleParts(filtered).some((part) => part.system === 'computing')).toBe(false)
  })

  it('allows every system to be turned off', () => {
    const state = systems.reduce((state, system) => reducer(state, { type: 'toggle-system', id: system.id }), initialState)
    expect(visibleParts(state)).toEqual([])
  })

  it.each([[-1, 0], [0.45, 0.45], [2, 1], [NaN, 0], [Infinity, 0], [-Infinity, 0]])(
    'normalizes explosion %s to %s', (value, expected) => {
      expect(reducer(initialState, { type: 'explosion', value }).explosion).toBe(expected)
    },
  )

  it('reset restores all filters, removes isolation and selection, and collapses the assembly', () => {
    let state = reducer(initialState, { type: 'toggle-system', id: 'power' })
    state = reducer(state, { type: 'select', id: 'processor' })
    state = reducer(state, { type: 'isolate' })
    state = reducer(state, { type: 'explosion', value: 0.8 })
    expect(reducer(state, { type: 'reset' })).toEqual(initialState)
    expect(initialState.enabledSystems).toHaveLength(5)
  })
})
