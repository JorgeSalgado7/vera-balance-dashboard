import { HttpException } from '@nestjs/common'
import { PatientErrorTranslator } from '../../../../presentation/http/errors/patient-error.translator'
import { PatientNotFoundError, PatientClinicNotFoundError, PatientUpdateConflictError, EmptyPatientUpdateError, InvalidPatientFieldError, InvalidPatientUpdateFieldsError } from '../../../../domain/errors/patient.error'

describe('PatientErrorTranslator', () => {
  it.each([[new PatientNotFoundError(), 404], [new PatientClinicNotFoundError(), 404], [new PatientUpdateConflictError(), 409], [new EmptyPatientUpdateError(), 400], [new InvalidPatientFieldError('guardian.name'), 400], [new InvalidPatientUpdateFieldsError(['clinic', 'created_at']), 400]])('translates %s to %s with a friendly detail', (error, status) => {
    try { PatientErrorTranslator.translate(error, '/patients/id'); throw new Error('expected translation') }
    catch (problem) { if (!(problem instanceof HttpException)) throw problem; expect(problem.getStatus()).toBe(status); expect(problem.getResponse()).toMatchObject({ detail: error.message, instance: '/patients/id' }) }
  })
  it('identifies the nested field that needs correction', () => {
    try { PatientErrorTranslator.translate(new InvalidPatientFieldError('guardian.name'), '/patients/id') }
    catch (problem) { expect((problem as HttpException).getResponse()).toMatchObject({ errors: [{ field: 'guardian.name', message: expect.any(String) }] }) }
  })
  it('leaves infrastructure failures to the existing shared filter', () => { expect(PatientErrorTranslator.translate(new Error('network'), '/patients')).toBeUndefined() })
})
