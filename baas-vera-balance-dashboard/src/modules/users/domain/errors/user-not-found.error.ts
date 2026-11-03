export class UserNotFoundError extends Error {
  constructor() {
    super('No se encontró el usuario solicitado.')
  }
}
