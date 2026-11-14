import { UpdateRecordDomainService } from '../../../domain/services/update-record.domain-service'
import { ValidateRecordDomainService } from '../../../domain/services/validate-record.domain-service'
import { EmptyRecordUpdateError, InvalidRecordFieldError, InvalidRecordUpdateFieldsError } from '../../../domain/errors/record.error'
import { recordEntity } from '../../fixtures/record.fixture'
const domain = new UpdateRecordDomainService(new ValidateRecordDomainService())
describe('UpdateRecordDomainService', () => {
  it('updates notes independently and supports explicit null clearing without changing the original', () => {
    const entity = { ...recordEntity(), tools: 'Anterior' }
    expect(domain.execute(entity, { resume: 'Resumen', tools: null })).toEqual({ resume: 'Resumen', tools: null })
    expect(entity.tools).toBe('Anterior')
  })
  it('accepts empty text notes', () => { expect(domain.execute(recordEntity(), { resume: '' })).toEqual({ resume: '' }) })
  it.each([{}, { resume: undefined }])('rejects empty updates', value => {
    expect(() => domain.execute(recordEntity(), value)).toThrow(EmptyRecordUpdateError)
  })
  it.each(['therapeutic_process', 'created_at', 'updated_at', 'pk', 'sk', 'gsi2pk', 'id', 'unknown'])('rejects changing %s', field => {
    expect(() => domain.execute(recordEntity(), { [field]: 'other' })).toThrow(InvalidRecordUpdateFieldsError)
  })
  it.each(['session_date', 'attendance'])('rejects null %s', field => {
    expect(() => domain.execute(recordEntity(), { [field]: null })).toThrow(InvalidRecordFieldError)
  })
})
