export class EmptyTherapyTypeUpdateError extends Error {
  constructor() { super('Se requiere al menos una propiedad para actualizar.') }
}
