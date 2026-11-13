import {
  ClinicNotFoundError, ClinicConflictError, EmptyClinicUpdateError,
  InvalidClinicFieldError, InvalidClinicUpdateFieldsError, InvalidClinicTherapyTypesError,
} from '../../../domain/errors/clinic.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class ClinicErrorTranslator {
  static translate(error: unknown, instance: string, operation: 'read' | 'create' | 'update' = 'read'): void {
    if (error instanceof ClinicNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof ClinicConflictError) throw HttpProblem.conflict(error.message, instance)
    if (error instanceof InvalidClinicTherapyTypesError && operation === 'read') {
      throw HttpProblem.internal('No pudimos recuperar los tipos de terapia asociados a la clínica. Inténtalo de nuevo en unos momentos.', instance)
    }
    if (error instanceof InvalidClinicFieldError || error instanceof InvalidClinicTherapyTypesError) {
      throw HttpProblem.badRequest(error.message, instance, [{ field: error.field, message: error.message }])
    }
    if (error instanceof InvalidClinicUpdateFieldsError) {
      throw HttpProblem.badRequest(error.message, instance, error.fields.map(field => ({ field, message: `No puedes actualizar el campo «${field}».` })))
    }
    if (error instanceof EmptyClinicUpdateError) throw HttpProblem.badRequest(error.message, instance)
  }
}
