import { Inject, Injectable } from '@nestjs/common'
import type { IRecordRepository } from '../../domain/repositories/record.repository'
import type { UpdateRecordResponseDto } from '../dtos/update-record-response.dto'
import { UpdateRecordDomainService } from '../../domain/services/update-record.domain-service'
import type { UpdateRecordDto } from '../dtos/update-record.dto'
import { RecordNotFoundError } from '../../domain/errors/record.error'

@Injectable()
export class UpdateRecordUseCase {
  constructor(@Inject('IRecordRepository') private readonly repository: IRecordRepository,
    private readonly domain: UpdateRecordDomainService) {}

  async execute(id: string, dto: UpdateRecordDto): Promise<UpdateRecordResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new RecordNotFoundError()
    const changes = this.domain.execute(entity, dto)
    const saved = await this.repository.update(id, changes, new Date(Date.now()).toISOString())
    return {
      id: saved.pk, session_date: saved.session_date, attendance: saved.attendance,
      resume: saved.resume, tools: saved.tools, therapeutic_process: saved.therapeutic_process,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }
  }
}
