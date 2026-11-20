import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import { sessionReducer, setSession, clearSession } from '../features/auth/application/store/session/session.slice'
import { loginReducer } from '../features/auth/application/store/login/login.slice'
import { sessionInitialState } from '../features/auth/application/store/session/session.initial-state'
import { loadSession } from '../features/auth/infrastructure/storage/load-session'
import { SESSION_STORAGE_KEY } from '../features/auth/infrastructure/storage/session-storage-key'
import { setLocalStorageItem } from '../shared/local-storage/set-local-storage-item'
import { removeLocalStorageItem } from '../shared/local-storage/remove-local-storage-item'

//* SESSION PERSISTENCE
const sessionListener = createListenerMiddleware()

sessionListener.startListening({
  actionCreator: setSession,
  effect: action => {
    setLocalStorageItem(SESSION_STORAGE_KEY, action.payload)
  },
})

sessionListener.startListening({
  actionCreator: clearSession,
  effect: () => {
    removeLocalStorageItem(SESSION_STORAGE_KEY)
  },
})

export const store = configureStore({
  reducer: {
    login: loginReducer,
    session: sessionReducer,
  },
  preloadedState: {
    session: loadSession() ?? sessionInitialState,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(sessionListener.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
