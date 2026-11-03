export class UserConsultationNotAllowedError extends Error {
  constructor() {
    super('No tienes permisos para consultar este usuario.')
  }
}
