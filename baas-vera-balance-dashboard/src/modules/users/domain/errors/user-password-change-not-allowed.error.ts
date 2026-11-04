export class UserPasswordChangeNotAllowedError extends Error {
  constructor() {
    super('Solo puedes cambiar la contraseña de tu propia cuenta.')
  }
}
