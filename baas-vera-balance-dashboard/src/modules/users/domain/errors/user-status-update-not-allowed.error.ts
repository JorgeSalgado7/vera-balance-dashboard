export class UserStatusUpdateNotAllowedError extends Error {
  constructor() {
    super('No tienes permisos para modificar el estatus de este usuario.')
  }
}
