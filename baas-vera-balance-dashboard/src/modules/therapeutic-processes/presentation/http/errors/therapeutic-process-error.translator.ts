import {
  TherapeuticProcessNotFoundError, InvalidTherapeuticProcessFieldError, EmptyTherapeuticProcessUpdateError,
  InvalidTherapeuticProcessUpdateFieldsError, TherapeuticProcessReferenceNotFoundError, TherapeuticProcessConflictError,
  UnsupportedTherapyTypeError, InvalidTherapyPatientCountError, InvalidChildTherapyPatientError,
  MissingTherapyPatientGuardianError, InvalidChildTherapyContactError, TherapeuticProcessTransactionLimitError,
} from '../../../domain/errors/therapeutic-process.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class TherapeuticProcessErrorTranslator {
  static translate(error: unknown, instance: string, operation: 'read' | 'write' = 'read'): void {
    if (error instanceof TherapeuticProcessNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof TherapeuticProcessConflictError || error instanceof TherapeuticProcessTransactionLimitError) throw HttpProblem.conflict(error.message, instance)
    if (error instanceof TherapeuticProcessReferenceNotFoundError) {
      if (operation === 'write' || ['clinic', 'patient'].includes(error.field)) throw HttpProblem.notFound(error.message, instance)
      throw HttpProblem.internal('No pudimos recuperar toda la información relacionada con el proceso terapéutico. Inténtalo de nuevo en unos momentos.', instance)
    }
    if (error instanceof EmptyTherapeuticProcessUpdateError) throw HttpProblem.badRequest(error.message, instance)
    if (error instanceof InvalidTherapeuticProcessUpdateFieldsError) throw HttpProblem.badRequest(error.message, instance, error.fields.map(field => ({ field, message: `No puedes actualizar el campo «${field}».` })))
    if (error instanceof InvalidTherapeuticProcessFieldError || error instanceof UnsupportedTherapyTypeError || error instanceof InvalidTherapyPatientCountError || error instanceof InvalidChildTherapyPatientError || error instanceof MissingTherapyPatientGuardianError || error instanceof InvalidChildTherapyContactError) throw HttpProblem.badRequest(error.message, instance, [{ field: error.field, message: error.message }])
  }
}
