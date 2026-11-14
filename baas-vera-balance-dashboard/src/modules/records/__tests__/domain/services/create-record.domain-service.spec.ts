import { CreateRecordDomainService } from '../../../domain/services/create-record.domain-service'
import { ValidateRecordDomainService } from '../../../domain/services/validate-record.domain-service'
import { InvalidRecordFieldError } from '../../../domain/errors/record.error'
import { recordEntity, now } from '../../fixtures/record.fixture'

const domain = new CreateRecordDomainService(new ValidateRecordDomainService())
const data = () => ({ ...recordEntity(), id: 'record-id' })
describe('CreateRecordDomainService', () => {
  it('builds only the documented keys and preserves supplied dates and nullable notes', () => {
    expect(domain.create(data())).toEqual(recordEntity())
    expect(domain.create(data()).created_at).toBe(now)
  })
  it.each(['Asistida', 'Cancelada', 'Con retraso', 'Falta'] as const)('accepts %s', attendance => {
    expect(domain.create({ ...data(), attendance }).attendance).toBe(attendance)
  })
  it.each(['', '2026-11-13', '2026-02-30T10:00:00Z', '2025-02-29T10:00:00Z', '2026-13-01T10:00:00Z', '2026-11-13T30:00:00Z', 'invalid'])('rejects invalid session date %s', session_date => {
    expect(() => domain.create({ ...data(), session_date })).toThrow(InvalidRecordFieldError)
  })
  it.each(['2024-02-29T10:00:00Z', '2026-11-13T10:30:00-06:00'])('accepts valid ISO %s without converting it', session_date => {
    expect(domain.create({ ...data(), session_date }).session_date).toBe(session_date)
  })
  it.each(['therapeutic_process', 'session_date', 'attendance'])('rejects missing %s', field => {
    const value = data(); Reflect.deleteProperty(value, field)
    expect(() => domain.create(value)).toThrow(InvalidRecordFieldError)
  })
  it.each(['resume', 'tools'])('rejects non-text %s', field => {
    expect(() => domain.create({ ...data(), [field]: 123 })).toThrow(InvalidRecordFieldError)
  })
})
