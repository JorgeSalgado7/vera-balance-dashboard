export class RecordNotFoundError extends Error {
  constructor() { super('No encontramos el registro de sesión solicitado.') }
}

export class RecordProcessNotFoundError extends Error {
  constructor() { super('No encontramos el proceso terapéutico. Revisa su identificador e inténtalo de nuevo.') }
}

export class InvalidRecordFieldError extends Error {
  constructor(readonly field: string) { super(`El campo «${field}» es obligatorio o contiene un valor no válido.`) }
}

export class EmptyRecordUpdateError extends Error {
  constructor() { super('Indica al menos un campo para actualizar el registro de sesión.') }
}

export class InvalidRecordUpdateFieldsError extends Error {
  constructor(readonly fields: string[]) { super(`No puedes actualizar estos campos del registro de sesión: ${fields.join(', ')}.`) }
}
