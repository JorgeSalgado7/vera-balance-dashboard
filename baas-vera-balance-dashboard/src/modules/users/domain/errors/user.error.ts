export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Ya existe un usuario registrado con este correo electrónico.')
  }
}

export class MissingUserNameError extends Error {
  readonly field = 'name'
  constructor() {
    super('El nombre del usuario es obligatorio.')
  }
}

export class MissingUserEmailError extends Error {
  readonly field = 'email'
  constructor() {
    super('El correo electrónico del usuario es obligatorio.')
  }
}

export class InvalidUserEmailError extends Error {
  readonly field = 'email'
  constructor() {
    super('El correo electrónico del usuario no es válido.')
  }
}

export class MissingUserPasswordError extends Error {
  readonly field = 'password'
  constructor() {
    super('La contraseña del usuario es obligatoria.')
  }
}

export class MissingUserProfessionalLicenseError extends Error {
  readonly field = 'professional_license'
  constructor() {
    super('La cédula profesional del usuario es obligatoria.')
  }
}

export class InvalidUserRoleError extends Error {
  readonly field = 'role'
  constructor() {
    super('El rol del usuario no es válido.')
  }
}

export class InvalidUserStatusError extends Error {
  readonly field = 'status'
  constructor() {
    super('El estado del usuario no es válido.')
  }
}

export class InvalidUserClinicError extends Error {
  readonly field = 'clinic'
  constructor() {
    super('La clínica asignada al usuario no es válida.')
  }
}

export class EmptyUserUpdateError extends Error {
  constructor() {
    super('Debes proporcionar al menos un campo para actualizar.')
  }
}

export class IncorrectCurrentUserPasswordError extends Error {
  readonly field = 'current_password'
  constructor() {
    super('La contraseña actual es incorrecta.')
  }
}

export class InvalidNewUserPasswordError extends Error {
  readonly field = 'password'
  constructor() {
    super('La nueva contraseña no es válida.')
  }
}

export class InvalidUserUpdateFieldsError extends Error {
  constructor(readonly fields: string[] = []) {
    super(fields.length ? `No puedes actualizar los siguientes campos: ${fields.join(', ')}.` : 'La solicitud contiene campos que no se pueden actualizar.')
  }
}

export class ReusedUserPasswordError extends Error {
  readonly field = 'password'
  constructor() {
    super('La nueva contraseña debe ser diferente de la actual.')
  }
}

export class UserDeletionConflictError extends Error {
  constructor() {
    super('El usuario cambió durante la operación. Consulta su información e intenta nuevamente.')
  }
}

export class UserHasTherapeuticProcessesError extends Error {
  constructor() {
    super('No se puede eliminar un terapeuta con procesos terapéuticos asociados.')
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('No se encontró el usuario solicitado.')
  }
}

export class UserPasswordConfirmationMismatchError extends Error {
  readonly field = 'password_confirmation'
  constructor() {
    super('La confirmación de contraseña no coincide.')
  }
}

export class UserUpdateConflictError extends Error {
  constructor() {
    super('El usuario cambió durante la actualización. Consulta sus datos e inténtalo nuevamente.')
  }
}
