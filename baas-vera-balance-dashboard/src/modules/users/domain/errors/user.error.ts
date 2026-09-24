export class MissingUserIdError extends Error {
  constructor() {
    super('User id is required.');
  }
}

export class MissingUserNameError extends Error {
  constructor() {
    super('User name is required.');
  }
}

export class MissingUserEmailError extends Error {
  constructor() {
    super('User email is required.');
  }
}

export class InvalidUserEmailError extends Error {
  constructor() {
    super('User email is invalid.');
  }
}

export class MissingUserPasswordError extends Error {
  constructor() {
    super('User password is required.');
  }
}

export class MissingUserPasswordHashError extends Error {
  constructor() {
    super('User password hash is required.');
  }
}

export class MissingUserProfessionalLicenseError extends Error {
  constructor() {
    super('User professional license is required.');
  }
}

export class MissingUserClinicError extends Error {
  constructor() {
    super('User clinic is required.');
  }
}

export class InvalidUserClinicError extends Error {
  constructor() {
    super('User clinic id is invalid.');
  }
}

export class InvalidUserRoleError extends Error {
  constructor() {
    super('User role is invalid.');
  }
}

export class MissingUserCreatedAtError extends Error {
  constructor() {
    super('User createdAt is required.');
  }
}

export class MissingUserUpdatedAtError extends Error {
  constructor() {
    super('User updatedAt is required.');
  }
}

export class UserEmailAlreadyExistsError extends Error {
  constructor() {
    super('A user with this email already exists.');
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found.');
  }
}

export class InvalidUserStatusError extends Error {
  constructor() {
    super('User status is invalid.');
  }
}
