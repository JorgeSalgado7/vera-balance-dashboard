export class EmptyUserUpdateError extends Error {
  constructor() {
    super('Debes proporcionar al menos un campo para actualizar.')
  }
}
