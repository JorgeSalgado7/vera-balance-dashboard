export class UserDeletionConflictError extends Error {
  constructor() {
    super('El usuario cambió durante la operación. Consulta su información e intenta nuevamente.')
  }
}
