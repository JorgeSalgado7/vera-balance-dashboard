import { PatientNotFoundError, PatientClinicNotFoundError, InvalidPatientFieldError, EmptyPatientUpdateError, InvalidPatientUpdateFieldsError, PatientUpdateConflictError } from '../../../domain/errors/patient.error'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class PatientErrorTranslator {
  static translate(error: unknown, instance: string): void {
    if (error instanceof PatientNotFoundError || error instanceof PatientClinicNotFoundError) throw HttpProblem.notFound(error.message, instance)
    if (error instanceof PatientUpdateConflictError) throw HttpProblem.conflict(error.message, instance)
    if (error instanceof EmptyPatientUpdateError) throw HttpProblem.badRequest(error.message, instance)
    if (error instanceof InvalidPatientFieldError) throw HttpProblem.badRequest(error.message, instance, [{ field: error.field, message: error.message }])
    if (error instanceof InvalidPatientUpdateFieldsError) throw HttpProblem.badRequest(error.message, instance, error.fields.map(field => ({ field, message: `No puedes actualizar el campo «${field}».` })))
  }
}
