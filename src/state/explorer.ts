import { parts, systems, type Part, type SystemId } from '../data/parts'

export interface ExplorerState {
  enabledSystems: SystemId[]
  selectedId: string | null
  isolatedId: string | null
  explosion: number
}

export type ExplorerAction =
  | { type: 'toggle-system'; id: SystemId }
  | { type: 'select'; id: string | null }
  | { type: 'isolate' }
  | { type: 'clear-isolation' }
  | { type: 'explosion'; value: number }
  | { type: 'reset' }

export const initialState: ExplorerState = {
  enabledSystems: systems.map((system) => system.id),
  selectedId: null,
  isolatedId: null,
  explosion: 0,
}

export function visibleParts(state: ExplorerState): Part[] {
  return parts.filter((part) =>
    state.enabledSystems.includes(part.system) &&
    (state.isolatedId === null || part.id === state.isolatedId),
  )
}

export function reducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case 'toggle-system': {
      const next = {
        ...state,
        enabledSystems: state.enabledSystems.includes(action.id)
          ? state.enabledSystems.filter((id) => id !== action.id)
          : [...state.enabledSystems, action.id],
        isolatedId: null,
      }
      return {
        ...next,
        selectedId: visibleParts(next).some((part) => part.id === state.selectedId)
          ? state.selectedId
          : null,
      }
    }
    case 'select':
      if (action.id === null) return { ...state, selectedId: null }
      return visibleParts(state).some((part) => part.id === action.id)
        ? { ...state, selectedId: action.id }
        : state
    case 'isolate':
      return state.selectedId !== null && visibleParts(state).some((part) => part.id === state.selectedId)
        ? { ...state, isolatedId: state.selectedId }
        : state
    case 'clear-isolation':
      return { ...state, isolatedId: null }
    case 'explosion':
      return { ...state, explosion: Number.isFinite(action.value) ? Math.max(0, Math.min(1, action.value)) : 0 }
    case 'reset':
      return { ...initialState, enabledSystems: [...initialState.enabledSystems] }
  }
}
