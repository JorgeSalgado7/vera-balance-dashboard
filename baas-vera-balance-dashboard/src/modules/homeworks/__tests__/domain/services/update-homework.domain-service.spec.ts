import { UpdateHomeworkDomainService } from '../../../domain/services/update-homework.domain-service'
import { ValidateHomeworkDomainService } from '../../../domain/services/validate-homework.domain-service'
import { EmptyHomeworkUpdateError, InvalidHomeworkFieldError, InvalidHomeworkUpdateFieldsError } from '../../../domain/errors/homework.error'
import { homeworkEntity } from '../../fixtures/homework.fixture'
const domain = new UpdateHomeworkDomainService(new ValidateHomeworkDomainService())
describe('UpdateHomeworkDomainService', () => {
  it('changes only the description without mutating the original', () => {
    const entity = homeworkEntity()
    expect(domain.execute(entity, { description: 'Otra actividad' })).toEqual({ description: 'Otra actividad' })
    expect(entity).toEqual(homeworkEntity())
  })
  it.each([{}, { description: undefined }])('rejects empty updates', data => {
    expect(() => domain.execute(homeworkEntity(), data)).toThrow(EmptyHomeworkUpdateError)
  })
  it.each(['', ' ', null, 23])('rejects an invalid description %s', description => {
    expect(() => domain.execute(homeworkEntity(), { description } as never)).toThrow(InvalidHomeworkFieldError)
  })
  it.each(['record', 'therapeutic_process', 'created_at', 'updated_at', 'id', 'pk', 'sk', 'gsi1pk', 'gsi2pk', 'other'])('forbids changing %s', field => {
    expect(() => domain.execute(homeworkEntity(), { description: 'Nueva', [field]: 'other' })).toThrow(InvalidHomeworkUpdateFieldsError)
  })
})
