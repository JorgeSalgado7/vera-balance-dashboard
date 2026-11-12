export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Token de renovación inválido o expirado.')
    this.name = 'InvalidRefreshTokenError'
  }
}
