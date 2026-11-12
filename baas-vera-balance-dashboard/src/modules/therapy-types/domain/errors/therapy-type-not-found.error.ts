export class TherapyTypeNotFoundError extends Error {
  constructor() { super('El tipo de terapia no existe.') }
}
