export class UserNotFoundError extends Error {
  constructor() { super('User not found.'); }
}

export class MissingUserNameError extends Error {
  constructor() { super('User name is required.'); }
}

export class InvalidUserEmailError extends Error {
  constructor() { super('User email is invalid.'); }
}

export class MissingUserProfessionalLicenseError extends Error {
  constructor() { super('User professional license is required.'); }
}

export class InvalidUserRoleError extends Error {
  constructor() { super('User role is invalid.'); }
}

export class InvalidUserStatusError extends Error {
  constructor() { super('User status is invalid.'); }
}

export class InvalidUserPasswordError extends Error {
  constructor() { super('Password must contain at least 12 characters.'); }
}

export class UserPasswordConfirmationMismatchError extends Error {
  constructor() { super('Password confirmation does not match.'); }
}

export class UserEmailAlreadyExistsError extends Error {
  constructor() { super('Email is already registered.'); }
}

export class UserAccessDeniedError extends Error {
  constructor() { super('Operation is not permitted.'); }
}

export class LastActiveAdministratorError extends Error {
  constructor() { super('The clinic must retain an active administrator.'); }
}

export class UserMutationConflictError extends Error {
  constructor() { super('User changed concurrently. Try again.'); }
}

export class ClinicUserCannotBeDeletedError extends Error {
  constructor() { super('Users with the clinic role cannot be deleted.'); }
}
