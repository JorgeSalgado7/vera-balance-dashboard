import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthSession } from '../../../domain/entities/auth-session.entity'
import { sessionInitialState } from './session.initial-state'

const sessionSlice = createSlice({
  name: 'auth/session',
  initialState: sessionInitialState,
  reducers: {
    setSession(_state, action: PayloadAction<AuthSession>) {
      return action.payload
    },
    clearSession() {
      return sessionInitialState
    },
  },
})

export const { setSession, clearSession } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
