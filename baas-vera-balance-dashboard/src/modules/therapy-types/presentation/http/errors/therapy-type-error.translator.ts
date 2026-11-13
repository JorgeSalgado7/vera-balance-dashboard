import { TherapyTypeInUseError, EmptyTherapyTypeUpdateError, TherapyTypeNotFoundError, TherapyTypeConflictError } from '../../../domain/errors/therapy-type.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class TherapyTypeErrorTranslator {
  static translate(error: unknown, instance: string): void {
    if (error instanceof EmptyTherapyTypeUpdateError) throw HttpProblem.badRequest(error.message, instance)
    if (error instanceof TherapyTypeNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof TherapyTypeConflictError || error instanceof TherapyTypeInUseError) throw HttpProblem.conflict(error.message, instance)
  }
}
