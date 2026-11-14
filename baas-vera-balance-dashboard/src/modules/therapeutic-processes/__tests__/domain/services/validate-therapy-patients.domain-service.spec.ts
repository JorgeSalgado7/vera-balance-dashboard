import { ValidateTherapyPatientsDomainService } from '../../../domain/services/validate-therapy-patients.domain-service'
import { UnsupportedTherapyTypeError, InvalidTherapyPatientCountError, InvalidChildTherapyPatientError, MissingTherapyPatientGuardianError, InvalidChildTherapyContactError } from '../../../domain/errors/therapeutic-process.error'
const adult = { birthday: '2000-01-01', guardian: null, phone_number: null }
const child = { birthday: '2020-01-01', guardian: { name: 'Tutor', phone_number: '555', relationship: 'Madre' }, phone_number: null }
const now = '2026-11-12T10:30:00.000Z'
describe('ValidateTherapyPatientsDomainService', () => {
  const domain = new ValidateTherapyPatientsDomainService()
  it.each([['Individual', [adult]], ['Pareja', [adult, adult]], ['Familiar', [adult, adult]], ['Familiar', [adult, adult, child]], ['Infantil', [child]]])('accepts documented patient counts for %s', (kind, patients) => {
    expect(() => domain.execute(kind as string, patients as typeof child[], now)).not.toThrow()
  })
  it.each([['Individual', []], ['Individual', [adult, adult]], ['Pareja', [adult]], ['Pareja', [adult, adult, adult]], ['Familiar', [adult]], ['Infantil', [child, child]]])('rejects invalid counts for %s', (kind, patients) => {
    expect(() => domain.execute(kind as string, patients as typeof child[], now)).toThrow(InvalidTherapyPatientCountError)
  })
  it('rejects unknown catalog modalities', () => { expect(() => domain.execute('Otra', [adult], now)).toThrow(UnsupportedTherapyTypeError) })
  it('rejects an adult in Infantil', () => { expect(() => domain.execute('Infantil', [adult], now)).toThrow(InvalidChildTherapyPatientError) })
  it('calculates age at the eighteenth birthday boundary', () => {
    expect(() => domain.execute('Infantil', [{ ...child, birthday: '2008-11-13' }], now)).not.toThrow()
    expect(() => domain.execute('Infantil', [{ ...child, birthday: '2008-11-12' }], now)).toThrow(InvalidChildTherapyPatientError)
  })
  it.each(['Individual', 'Infantil', 'Familiar'])('requires guardian data for a minor in %s', kind => {
    const patients = [{ ...child, guardian: null }, ...(kind === 'Familiar' ? [adult] : [])]
    expect(() => domain.execute(kind, patients, now)).toThrow(MissingTherapyPatientGuardianError)
  })
  it('uses the tutor contact for Infantil, rejecting a separate patient phone', () => { expect(() => domain.execute('Infantil', [{ ...child, phone_number: '555' }], now)).toThrow(InvalidChildTherapyContactError) })
})
