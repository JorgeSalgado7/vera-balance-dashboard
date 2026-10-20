export class InvalidCredentialsError extends Error {
  constructor() { super('Invalid credentials.'); }
}

export class InvalidSessionError extends Error {
  constructor() { super('Invalid or expired session.'); }
}

export class InactiveAccountError extends Error {
  constructor() { super('The user or clinic is not active.'); }
}

export class InvalidRecoveryCodeError extends Error {
  constructor() { super('Invalid or expired recovery code.'); }
}

export class PasswordConfirmationMismatchError extends Error {
  constructor() { super('Password confirmation does not match.'); }
}

export class MissingPasswordError extends Error {
  constructor() { super('Password and confirmation are required.'); }
}

export class PasswordPolicyUnavailableError extends Error {
  constructor() { super('The password change policy has not been defined.'); }
}

export class PasswordTooShortError extends Error {
  constructor() { super('Password does not meet the configured minimum length.'); }
}
