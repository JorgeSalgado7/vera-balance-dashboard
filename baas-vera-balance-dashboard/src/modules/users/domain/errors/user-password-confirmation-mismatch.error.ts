export class UserPasswordConfirmationMismatchError extends Error {
  constructor() {
    super('La confirmación de contraseña no coincide.')
  }
}
