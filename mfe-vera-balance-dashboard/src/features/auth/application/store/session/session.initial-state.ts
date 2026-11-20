import type { SessionStateI } from './interfaces/session-state.interface'

export const sessionInitialState: SessionStateI = {
  accessToken: null,
  refreshToken: null,
  user: null,
}
