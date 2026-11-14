import { InvalidHomeworkFieldError } from '../errors/homework.error'
import { HomeworkEntity } from '../entities/homework.entity'
import { ValidateHomeworkDomainService } from './validate-homework.domain-service'

export class CreateHomeworkDomainService {
  constructor(private readonly validator: ValidateHomeworkDomainService) {}

  create(data: Pick<HomeworkEntity, 'description' | 'record' | 'created_at' | 'updated_at'> & { id: string, therapeutic_process: string }): HomeworkEntity {
    const entity = Object.assign(new HomeworkEntity(), {
      pk: data.id, sk: 'HOME_WORK', gsi1pk: 'HOME_WORK', gsi1sk: `HOME_WORK#${data.id}`,
      gsi2pk: `RECORD#${data.record}`, gsi2sk: `HOME_WORK#${data.id}`,
      description: data.description, record: data.record, therapeutic_process: data.therapeutic_process, created_at: data.created_at, updated_at: data.updated_at,
    })
    this.validator.execute(entity)
    if (typeof data.therapeutic_process !== 'string' || !data.therapeutic_process.trim()) throw new InvalidHomeworkFieldError('therapeutic_process')
    return entity
  }
}
