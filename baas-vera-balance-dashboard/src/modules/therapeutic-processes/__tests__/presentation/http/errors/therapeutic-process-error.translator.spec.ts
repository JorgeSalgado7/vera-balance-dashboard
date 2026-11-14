import { HttpException } from '@nestjs/common'
import { TherapeuticProcessErrorTranslator } from '../../../../presentation/http/errors/therapeutic-process-error.translator'
import { TherapeuticProcessNotFoundError, TherapeuticProcessConflictError, TherapeuticProcessReferenceNotFoundError, EmptyTherapeuticProcessUpdateError, InvalidTherapeuticProcessUpdateFieldsError, InvalidTherapeuticProcessFieldError, UnsupportedTherapyTypeError, InvalidTherapyPatientCountError, InvalidChildTherapyPatientError, MissingTherapyPatientGuardianError, InvalidChildTherapyContactError, TherapeuticProcessTransactionLimitError } from '../../../../domain/errors/therapeutic-process.error'

describe('TherapeuticProcessErrorTranslator', () => {
  it.each([[new TherapeuticProcessNotFoundError(), 404], [new TherapeuticProcessReferenceNotFoundError('patients'), 404], [new TherapeuticProcessConflictError(), 409], [new TherapeuticProcessTransactionLimitError(), 409], [new EmptyTherapeuticProcessUpdateError(), 400], [new InvalidTherapeuticProcessUpdateFieldsError(['clinic']), 400], [new InvalidTherapeuticProcessFieldError('goals'), 400], [new UnsupportedTherapyTypeError(), 400], [new InvalidTherapyPatientCountError('Pareja', 'exactamente dos pacientes'), 400], [new InvalidChildTherapyPatientError(), 400], [new MissingTherapyPatientGuardianError(), 400], [new InvalidChildTherapyContactError(), 400]])('translates %s to %s with its readable message', (error, status) => {
    try { TherapeuticProcessErrorTranslator.translate(error, '/therapeutic-processes/id', 'write'); throw new Error('Expected translation') }
    catch (problem) { if (!(problem instanceof HttpException)) throw problem; expect(problem.getStatus()).toBe(status); expect(problem.getResponse()).toMatchObject({ detail: error.message, instance: '/therapeutic-processes/id' }) }
  })
  it('reports a broken stored relation as an internal read failure', () => {
    try { TherapeuticProcessErrorTranslator.translate(new TherapeuticProcessReferenceNotFoundError('therapy_type'), '/therapeutic-processes/id') }
    catch (problem) { expect((problem as HttpException).getStatus()).toBe(500) }
  })
  it('leaves infrastructure errors to the existing shared filter', () => { expect(TherapeuticProcessErrorTranslator.translate(new Error('network'), '/therapeutic-processes')).toBeUndefined() })
})
