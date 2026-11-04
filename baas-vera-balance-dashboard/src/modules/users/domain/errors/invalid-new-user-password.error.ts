export class InvalidNewUserPasswordError extends Error {
  constructor() {
    super('La nueva contraseña no es válida.')
  }
}
