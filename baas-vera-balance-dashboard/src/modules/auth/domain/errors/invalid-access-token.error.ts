export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Token de acceso inválido o expirado.')
    this.name = 'InvalidAccessTokenError'
  }
}
