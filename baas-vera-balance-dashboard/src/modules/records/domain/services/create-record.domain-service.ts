import { RecordEntity } from '../entities/record.entity'
import { ValidateRecordDomainService } from './validate-record.domain-service'

export class CreateRecordDomainService {
  constructor(private readonly validator: ValidateRecordDomainService) {}

  create(data: Pick<RecordEntity, 'session_date' | 'attendance' | 'resume' | 'tools' | 'therapeutic_process' | 'created_at' | 'updated_at'> & { id: string }): RecordEntity {
    const entity = Object.assign(new RecordEntity(), {
      pk: data.id, sk: 'RECORD', gsi1pk: 'RECORD', gsi1sk: `RECORD#${data.id}`,
      gsi2pk: `THERAPEUTIC_PROCESS#${data.therapeutic_process}`, gsi2sk: `RECORD#${data.id}`,
      session_date: data.session_date, attendance: data.attendance, resume: data.resume, tools: data.tools,
      therapeutic_process: data.therapeutic_process, created_at: data.created_at, updated_at: data.updated_at,
    })
    this.validator.execute(entity)
    return entity
  }
}
