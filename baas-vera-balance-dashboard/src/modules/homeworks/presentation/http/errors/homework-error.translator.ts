import { HomeworkNotFoundError, InvalidHomeworkFieldError, EmptyHomeworkUpdateError, InvalidHomeworkUpdateFieldsError } from '../../../domain/errors/homework.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class HomeworkErrorTranslator {
  static translate(error: unknown, instance: string): void {
    if (error instanceof HomeworkNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof EmptyHomeworkUpdateError) throw HttpProblem.badRequest(error.message, instance)
    if (error instanceof InvalidHomeworkFieldError) throw HttpProblem.badRequest(error.message, instance, [{ field: error.field, message: error.message }])
    if (error instanceof InvalidHomeworkUpdateFieldsError) throw HttpProblem.badRequest(error.message, instance, error.fields.map(field => ({ field, message: `No puedes actualizar el campo «${field}».` })))
  }
}
