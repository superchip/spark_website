import { create } from 'zustand'
import { Spark, SparkCompletion, SessionState } from '@/types'
import { generateUUID } from '@/lib/utils'

interface SessionStore extends SessionState {
  startSession: (goalId: string) => void
  endSession: () => void
  setCurrentSpark: (spark: Spark | null) => void
  addCompletedSpark: (completion: SparkCompletion) => void
  incrementChain: () => void
  resetSession: () => void
}

const initialState: SessionState = {
  sessionId: null,
  goalId: null,
  currentSpark: null,
  completedSparks: [],
  chainLength: 0,
  isActive: false,
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  startSession: (goalId: string) => {
    set({
      sessionId: generateUUID(),
      goalId,
      isActive: true,
      completedSparks: [],
      chainLength: 0,
    })
  },

  endSession: () => {
    set({
      isActive: false,
    })
  },

  setCurrentSpark: (spark: Spark | null) => {
    set({ currentSpark: spark })
  },

  addCompletedSpark: (completion: SparkCompletion) => {
    set((state) => ({
      completedSparks: [...state.completedSparks, completion],
    }))
  },

  incrementChain: () => {
    set((state) => ({
      chainLength: state.chainLength + 1,
    }))
  },

  resetSession: () => {
    set(initialState)
  },
}))
