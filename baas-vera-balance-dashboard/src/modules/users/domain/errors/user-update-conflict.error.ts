export class UserUpdateConflictError extends Error {
  constructor() {
    super('El usuario cambió durante la actualización. Consulta sus datos e inténtalo nuevamente.')
  }
}
