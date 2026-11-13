import { ValidatePatientDomainService } from '../../../domain/services/validate-patient.domain-service'
import { InvalidPatientFieldError } from '../../../domain/errors/patient.error'
import { patient } from '../../fixtures/patient.fixture'

describe('ValidatePatientDomainService', () => {
  const domain = new ValidatePatientDomainService()
  it.each(['clinic', 'name', 'occupation', 'religion', 'address'])('rejects whitespace-only %s', field => {
    expect(() => domain.execute({ ...patient(), [field]: ' ' })).toThrow(InvalidPatientFieldError)
  })
  it.each([{ birthday: '2025-02-29' }, { birthday: '2024-02-30' }, { birthday: 'invalid' }, { gender: 'Otro' }, { educational_level: 'Otro' }, { marital_status: 'Otro' }, { phone_number: 123 }, { guardian: [] }, { partner_data: { name: 'Pareja', relationship_time: '2 años', occupation: ' ' } }])('rejects malformed data %j', changes => {
    expect(() => domain.execute({ ...patient(), ...changes } as never)).toThrow(InvalidPatientFieldError)
  })
  it('identifies a missing nested field', () => {
    try { domain.execute({ ...patient(), guardian: { name: 'Tutor' } } as never); throw new Error('expected validation') }
    catch (error) { expect(error).toBeInstanceOf(InvalidPatientFieldError); expect((error as InvalidPatientFieldError).field).toBe('guardian.phone_number') }
  })
  it('accepts nullable optional data and a leap birthday', () => { expect(() => domain.execute({ ...patient(), birthday: '2024-02-29' })).not.toThrow() })
})
