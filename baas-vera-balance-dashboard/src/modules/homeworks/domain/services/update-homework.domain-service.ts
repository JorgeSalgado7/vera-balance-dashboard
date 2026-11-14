import type { HomeworkEntity } from '../entities/homework.entity'
import { ValidateHomeworkDomainService } from './validate-homework.domain-service'
import { EmptyHomeworkUpdateError, InvalidHomeworkUpdateFieldsError } from '../errors/homework.error'

export class UpdateHomeworkDomainService {
  constructor(private readonly validator: ValidateHomeworkDomainService) {}

  execute(entity: HomeworkEntity, input: Partial<Pick<HomeworkEntity, 'description'>>): Partial<Pick<HomeworkEntity, 'description'>> {
    const invalid = Object.keys(input).filter(field => field !== 'description')
    if (invalid.length) throw new InvalidHomeworkUpdateFieldsError(invalid)
    if (input.description === undefined) throw new EmptyHomeworkUpdateError()
    const changes = { description: input.description }
    this.validator.execute({ ...entity, ...changes })
    return changes
  }
}
