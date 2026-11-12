export class EmptyTherapyTypeUpdateError extends Error {
  constructor() { super('Indica al menos un campo para actualizar: nombre o icono.') }
}

export class TherapyTypeConflictError extends Error {
  constructor() { super('No pudimos guardar el tipo de terapia porque la información ya existe o cambió durante la operación. Actualiza la lista e inténtalo de nuevo.') }
}

export class TherapyTypeNotFoundError extends Error {
  constructor() { super('No encontramos el tipo de terapia solicitado. Es posible que haya sido eliminado.') }
}
