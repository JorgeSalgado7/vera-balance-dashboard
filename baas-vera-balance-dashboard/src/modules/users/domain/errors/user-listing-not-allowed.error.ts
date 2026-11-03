export class UserListingNotAllowedError extends Error {
  constructor() {
    super('No tienes permisos para consultar el listado global de usuarios.')
  }
}
