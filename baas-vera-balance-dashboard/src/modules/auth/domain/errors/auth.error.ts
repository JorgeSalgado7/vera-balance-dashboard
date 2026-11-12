export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Tu sesión no es válida o ha vencido. Inicia sesión de nuevo.')
    this.name = 'InvalidAccessTokenError'
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('El correo electrónico o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.')
    this.name = 'InvalidCredentialsError'
  }
}

export class InvalidPasswordRecoveryCodeError extends Error {
  constructor() {
    super('El código de recuperación no es válido o ha vencido. Revisa el código o solicita uno nuevo.')
    this.name = 'InvalidPasswordRecoveryCodeError'
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Tu sesión no se puede renovar. Inicia sesión de nuevo.')
    this.name = 'InvalidRefreshTokenError'
  }
}
