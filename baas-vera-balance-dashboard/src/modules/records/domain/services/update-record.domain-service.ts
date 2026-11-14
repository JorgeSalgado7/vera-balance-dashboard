import type { RecordEntity } from '../entities/record.entity'
import { ValidateRecordDomainService } from './validate-record.domain-service'
import { EmptyRecordUpdateError, InvalidRecordUpdateFieldsError } from '../errors/record.error'

export class UpdateRecordDomainService {
  constructor(private readonly validator: ValidateRecordDomainService) {}

  execute(entity: RecordEntity, input: Partial<Pick<RecordEntity, 'session_date' | 'attendance' | 'resume' | 'tools'>>): Partial<Pick<RecordEntity, 'session_date' | 'attendance' | 'resume' | 'tools'>> {
    const allowed = ['session_date', 'attendance', 'resume', 'tools'] as const
    const invalid = Object.keys(input).filter(key => !(allowed as readonly string[]).includes(key))
    if (invalid.length) throw new InvalidRecordUpdateFieldsError(invalid)
    const changes: typeof input = {}
    for (const field of allowed) {
      if (input[field] !== undefined) Object.assign(changes, { [field]: input[field] })
    }
    if (!Object.keys(changes).length) throw new EmptyRecordUpdateError()
    this.validator.execute({ ...entity, ...changes })
    return changes
  }
}
