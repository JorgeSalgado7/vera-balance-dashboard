export class UserDeletionNotAllowedError extends Error {
  constructor() {
    super('No tienes permisos para eliminar usuarios.')
  }
}
