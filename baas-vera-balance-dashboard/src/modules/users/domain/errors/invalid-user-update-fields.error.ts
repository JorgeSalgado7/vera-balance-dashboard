export class InvalidUserUpdateFieldsError extends Error {
  constructor() {
    super('La solicitud contiene campos que no se pueden actualizar.')
  }
}
