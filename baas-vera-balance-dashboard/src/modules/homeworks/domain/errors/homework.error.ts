export class HomeworkNotFoundError extends Error {
  constructor() { super('No encontramos la tarea solicitada.') }
}

export class InvalidHomeworkFieldError extends Error {
  constructor(readonly field: string) { super(`El campo «${field}» es obligatorio y debe contener un texto válido.`) }
}

export class EmptyHomeworkUpdateError extends Error {
  constructor() { super('Indica una descripción para actualizar la tarea.') }
}

export class InvalidHomeworkUpdateFieldsError extends Error {
  constructor(readonly fields: string[]) { super(`No puedes actualizar estos campos de la tarea: ${fields.join(', ')}.`) }
}
