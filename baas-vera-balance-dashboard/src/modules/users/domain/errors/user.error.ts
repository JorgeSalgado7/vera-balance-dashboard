export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Ya existe un usuario registrado con este correo electrónico.')
  }
}

export class UserCreationNotAllowedError extends Error {
  constructor() {
    super('No tienes permisos para crear este usuario.')
  }
}

export class MissingUserNameError extends Error {
  constructor() {
    super('El nombre del usuario es obligatorio.')
  }
}

export class MissingUserEmailError extends Error {
  constructor() {
    super('El correo electrónico del usuario es obligatorio.')
  }
}

export class InvalidUserEmailError extends Error {
  constructor() {
    super('El correo electrónico del usuario no es válido.')
  }
}

export class MissingUserPasswordError extends Error {
  constructor() {
    super('La contraseña del usuario es obligatoria.')
  }
}

export class MissingUserProfessionalLicenseError extends Error {
  constructor() {
    super('La cédula profesional del usuario es obligatoria.')
  }
}

export class InvalidUserRoleError extends Error {
  constructor() {
    super('El rol del usuario no es válido.')
  }
}

export class InvalidUserStatusError extends Error {
  constructor() {
    super('El estado del usuario no es válido.')
  }
}

export class InvalidUserClinicError extends Error {
  constructor() {
    super('La clínica asignada al usuario no es válida.')
  }
}
