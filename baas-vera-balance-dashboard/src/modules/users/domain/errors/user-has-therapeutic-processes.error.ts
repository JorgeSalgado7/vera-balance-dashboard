export class UserHasTherapeuticProcessesError extends Error {
  constructor() {
    super('No se puede eliminar un terapeuta con procesos terapéuticos asociados.')
  }
}
