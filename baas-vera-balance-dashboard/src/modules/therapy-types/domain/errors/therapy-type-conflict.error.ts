export class TherapyTypeConflictError extends Error {
  constructor() { super('La operación sobre el tipo de terapia entró en conflicto.') }
}
