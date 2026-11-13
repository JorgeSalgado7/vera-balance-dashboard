import { HttpException } from '@nestjs/common'
import { ClinicErrorTranslator } from '../../../../presentation/http/errors/clinic-error.translator'
import { ClinicNotFoundError, ClinicConflictError, EmptyClinicUpdateError, InvalidClinicFieldError, InvalidClinicUpdateFieldsError, InvalidClinicTherapyTypesError } from '../../../../domain/errors/clinic.error'

describe('ClinicErrorTranslator', () => {
  it.each([[new ClinicNotFoundError(), 404], [new ClinicConflictError(), 409], [new EmptyClinicUpdateError(), 400], [new InvalidClinicFieldError('name'), 400], [new InvalidClinicUpdateFieldsError(['created_at']), 400], [new InvalidClinicTherapyTypesError(), 400]])('translates %s to %s with a readable detail', (error, status) => {
    try { ClinicErrorTranslator.translate(error, '/clinics', 'update'); throw new Error('expected translation') }
    catch (problem) { expect(problem).toBeInstanceOf(HttpException); expect((problem as HttpException).getStatus()).toBe(status); expect((problem as HttpException).getResponse()).toMatchObject({ detail: error.message, instance: '/clinics' }) }
  })
  it('treats an unresolved stored relation as a server failure on reads', () => {
    try { ClinicErrorTranslator.translate(new InvalidClinicTherapyTypesError(), '/clinics') }
    catch (problem) { expect((problem as HttpException).getStatus()).toBe(500) }
  })
  it('leaves infrastructure errors to the existing global filter', () => { expect(ClinicErrorTranslator.translate(new Error('network'), '/clinics')).toBeUndefined() })
})
