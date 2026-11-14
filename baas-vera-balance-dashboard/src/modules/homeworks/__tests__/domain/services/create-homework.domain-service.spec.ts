import { CreateHomeworkDomainService } from '../../../domain/services/create-homework.domain-service'
import { ValidateHomeworkDomainService } from '../../../domain/services/validate-homework.domain-service'
import { InvalidHomeworkFieldError } from '../../../domain/errors/homework.error'
import { homeworkEntity } from '../../fixtures/homework.fixture'
const domain = new CreateHomeworkDomainService(new ValidateHomeworkDomainService())
const data = () => ({ ...homeworkEntity(), id: 'homework-id', therapeutic_process: 'process-id' })
describe('CreateHomeworkDomainService', () => {
  it('builds the documented item with the record relation and preserves ISO dates', () => {
    expect(domain.create(data())).toEqual(homeworkEntity())
  })
  it('preserves multiline descriptions', () => {
    const description = '  Respirar.\nAnotar emociones.  '
    expect(domain.create({ ...data(), description }).description).toBe(description)
  })
  it.each(['description', 'record', 'therapeutic_process'])('identifies invalid %s', field => {
    for (const value of [undefined, null, '', '  ', 123, [], {}]) {
      try { domain.create({ ...data(), [field]: value }); throw new Error('Expected validation') }
      catch (error) { expect(error).toBeInstanceOf(InvalidHomeworkFieldError); expect(error).toHaveProperty('field', field) }
    }
  })
})
