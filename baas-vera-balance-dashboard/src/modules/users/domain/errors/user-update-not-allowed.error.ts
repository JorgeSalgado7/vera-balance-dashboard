export class UserUpdateNotAllowedError extends Error {
  constructor() {
    super('No tienes permisos para realizar esta actualización de usuario.')
  }
}
