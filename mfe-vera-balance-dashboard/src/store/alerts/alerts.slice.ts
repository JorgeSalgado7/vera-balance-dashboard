import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { AppAlertI, AppAlertType } from './interfaces/alerts-state.interface'
import { alertsInitialState } from './alerts.initial-state'

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: alertsInitialState,
  reducers: {
    showAlert: {
      prepare(source: string, message: string, type: AppAlertType) {
        return { payload: { id: nanoid(), source, message, type } }
      },
      reducer(state, action: PayloadAction<AppAlertI>) {
        state.items = state.items.filter(item => item.source !== action.payload.source)
        state.items.push(action.payload)
      },
    },
    dismissAlert(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    clearAlertSource(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.source !== action.payload)
    },
  },
})

export const { showAlert, dismissAlert, clearAlertSource } = alertsSlice.actions
export const alertsReducer = alertsSlice.reducer
