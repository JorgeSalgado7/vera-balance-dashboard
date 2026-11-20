import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loginInitialState } from './login.initial-state'

const loginSlice = createSlice({
  name: 'auth/login',
  initialState: loginInitialState,
  reducers: {
    resetLogin() {
      return loginInitialState
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload
    },
    setEmailError(state, action: PayloadAction<boolean>) {
      state.emailError = action.payload
    },
    setEmailErrorMessage(state, action: PayloadAction<string>) {
      state.emailErrorMessage = action.payload
    },
    setPasswordError(state, action: PayloadAction<boolean>) {
      state.passwordError = action.payload
    },
    setPasswordErrorMessage(state, action: PayloadAction<string>) {
      state.passwordErrorMessage = action.payload
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload
    },
  },
})

export const { resetLogin, setEmail, setPassword, setEmailError, setPasswordError, setEmailErrorMessage, setPasswordErrorMessage } = loginSlice.actions
export const loginReducer = loginSlice.reducer
