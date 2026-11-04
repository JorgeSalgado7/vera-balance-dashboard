export class IncorrectCurrentUserPasswordError extends Error {
  constructor() {
    super('La contraseña actual es incorrecta.')
  }
}
