export class TherapeuticProcessNotFoundError extends Error {
  constructor() { super('No encontramos el proceso terapéutico solicitado.') }
}

export class InvalidTherapeuticProcessFieldError extends Error {
  constructor(readonly field: string) { super(`El campo «${field}» es obligatorio o contiene un valor no válido.`) }
}

export class EmptyTherapeuticProcessUpdateError extends Error {
  constructor() { super('Indica al menos un campo para actualizar el proceso terapéutico.') }
}

export class InvalidTherapeuticProcessUpdateFieldsError extends Error {
  constructor(readonly fields: string[]) { super(`No puedes actualizar estos campos del proceso terapéutico: ${fields.join(', ')}.`) }
}

export class TherapeuticProcessReferenceNotFoundError extends Error {
  constructor(readonly field: string) { super(`No encontramos uno o más elementos de «${field}». Revisa los identificadores e inténtalo de nuevo.`) }
}

export class TherapeuticProcessConflictError extends Error {
  constructor() { super('El proceso terapéutico ya existe o cambió durante la operación. Actualiza los datos e inténtalo de nuevo.') }
}

export class UnsupportedTherapyTypeError extends Error {
  readonly field = 'therapy_type'
  constructor() { super('Selecciona un tipo de terapia llamado Individual, Pareja, Familiar o Infantil.') }
}

export class InvalidTherapyPatientCountError extends Error {
  readonly field = 'patients'
  constructor(kind: string, quantity: string) { super(`La terapia ${kind} requiere ${quantity}. Revisa los pacientes seleccionados.`) }
}

export class InvalidChildTherapyPatientError extends Error {
  readonly field = 'patients'
  constructor() { super('La terapia Infantil requiere un paciente menor de 18 años.') }
}

export class MissingTherapyPatientGuardianError extends Error {
  readonly field = 'patients'
  constructor() { super('Los pacientes menores de edad deben tener registrados los datos de su tutor para esta terapia.') }
}

export class InvalidChildTherapyContactError extends Error {
  readonly field = 'patients'
  constructor() { super('En terapia Infantil, el teléfono de contacto debe registrarse en los datos del tutor, no como teléfono propio del paciente.') }
}

export class TherapeuticProcessTransactionLimitError extends Error {
  constructor() { super('La operación supera los 100 cambios que DynamoDB permite guardar juntos. Reduce los cambios de pacientes e inténtalo de nuevo.') }
}
