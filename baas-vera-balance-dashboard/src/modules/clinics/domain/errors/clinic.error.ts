export class ClinicNotFoundError extends Error {
  constructor() { super('No encontramos la clínica solicitada. Revisa el identificador e inténtalo de nuevo.') }
}

export class ClinicConflictError extends Error {
  constructor() { super('La información de la clínica ya existe o cambió durante la operación. Actualiza los datos e inténtalo de nuevo.') }
}

export class EmptyClinicUpdateError extends Error {
  constructor() { super('Indica al menos un campo para actualizar la clínica.') }
}

export class InvalidClinicFieldError extends Error {
  constructor(readonly field: string) {
    super(`El campo «${field}» es obligatorio o contiene un valor no válido.`)
  }
}

export class InvalidClinicUpdateFieldsError extends Error {
  constructor(readonly fields: string[]) {
    super(`No puedes actualizar los siguientes campos de la clínica: ${fields.join(', ')}.`)
  }
}

export class InvalidClinicTherapyTypesError extends Error {
  readonly field = 'therapy_types'
  constructor() { super('Uno o más tipos de terapia no existen. Revisa la selección e inténtalo de nuevo.') }
}
