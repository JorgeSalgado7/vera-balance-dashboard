import { EmptyTherapyTypeUpdateError } from '../../../domain/errors/empty-therapy-type-update.error'
import { TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type-not-found.error'
import { TherapyTypeConflictError } from '../../../domain/errors/therapy-type-conflict.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class TherapyTypeErrorTranslator {
  static translate(error: unknown, instance: string): void {
    if (error instanceof EmptyTherapyTypeUpdateError) throw HttpProblem.badRequest(error.message, instance)
    if (error instanceof TherapyTypeNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof TherapyTypeConflictError) throw HttpProblem.conflict(error.message, instance)
  }
}
