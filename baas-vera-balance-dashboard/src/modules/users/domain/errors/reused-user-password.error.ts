export class ReusedUserPasswordError extends Error {
  constructor() {
    super('La nueva contraseña debe ser diferente de la actual.')
  }
}
