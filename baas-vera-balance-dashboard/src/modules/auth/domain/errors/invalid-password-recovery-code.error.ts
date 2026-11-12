export class InvalidPasswordRecoveryCodeError extends Error {
  constructor() {
    super('Código de recuperación inválido o expirado.')
    this.name = 'InvalidPasswordRecoveryCodeError'
  }
}
