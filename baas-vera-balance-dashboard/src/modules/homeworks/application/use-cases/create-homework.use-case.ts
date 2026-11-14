import { Inject, Injectable } from '@nestjs/common'
import type { IHomeworkRepository } from '../../domain/repositories/homework.repository'
import type { CreateHomeworkResponseDto } from '../dtos/create-homework-response.dto'
import { GetRecordByIdUseCase } from '../../../records/application/use-cases/get-record-by-id.use-case'
import { CreateHomeworkDomainService } from '../../domain/services/create-homework.domain-service'
import type { CreateHomeworkDto } from '../dtos/create-homework.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class CreateHomeworkUseCase {
  constructor(@Inject('IHomeworkRepository') private readonly repository: IHomeworkRepository,
    private readonly records: GetRecordByIdUseCase,
    private readonly domain: CreateHomeworkDomainService) {}

  async execute(dto: CreateHomeworkDto): Promise<CreateHomeworkResponseDto> {
    const record = await this.records.execute(dto.record)
    const now = new Date(Date.now()).toISOString()
    const entity = this.domain.create({
      id: randomUUID(), description: dto.description, record: dto.record, therapeutic_process: record.therapeutic_process, created_at: now, updated_at: now,
    })
    const saved = await this.repository.create(entity)
    return {
      id: saved.pk, description: saved.description, record: saved.record, therapeutic_process: record.therapeutic_process,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }
  }
}
