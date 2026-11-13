export class PatientNotFoundError extends Error {
  constructor() { super('No encontramos el paciente solicitado. Revisa el identificador e inténtalo de nuevo.') }
}

export class PatientClinicNotFoundError extends Error {
  constructor() { super('No encontramos la clínica indicada. Revisa el identificador e inténtalo de nuevo.') }
}

export class InvalidPatientFieldError extends Error {
  constructor(readonly field: string) { super(`El campo «${field}» es obligatorio o contiene un valor no válido.`) }
}

export class EmptyPatientUpdateError extends Error {
  constructor() { super('Indica al menos un campo para actualizar el paciente.') }
}

export class InvalidPatientUpdateFieldsError extends Error {
  constructor(readonly fields: string[]) { super(`No puedes actualizar los siguientes campos del paciente: ${fields.join(', ')}.`) }
}

export class PatientUpdateConflictError extends Error {
  constructor() { super('La información del paciente cambió durante la operación. Actualiza los datos e inténtalo de nuevo.') }
}
