import { RecordNotFoundError, RecordProcessNotFoundError, InvalidRecordFieldError, EmptyRecordUpdateError, InvalidRecordUpdateFieldsError } from '../../../domain/errors/record.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class RecordErrorTranslator {
  static translate(error: unknown, instance: string): void {
    if (error instanceof RecordNotFoundError || error instanceof RecordProcessNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof EmptyRecordUpdateError) throw HttpProblem.badRequest(error.message, instance)
    if (error instanceof InvalidRecordFieldError) throw HttpProblem.badRequest(error.message, instance, [{ field: error.field, message: error.message }])
    if (error instanceof InvalidRecordUpdateFieldsError) throw HttpProblem.badRequest(error.message, instance, error.fields.map(field => ({ field, message: `No puedes actualizar el campo «${field}».` })))
  }
}
