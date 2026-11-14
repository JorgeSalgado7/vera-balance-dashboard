import { Inject, Injectable } from '@nestjs/common'
import type { IRecordRepository } from '../../domain/repositories/record.repository'
import type { CreateRecordResponseDto } from '../dtos/create-record-response.dto'
import { TherapeuticProcessExistsUseCase } from '../../../therapeutic-processes/application/use-cases/therapeutic-process-exists.use-case'
import { RecordProcessNotFoundError } from '../../domain/errors/record.error'
import { CreateRecordDomainService } from '../../domain/services/create-record.domain-service'
import type { CreateRecordDto } from '../dtos/create-record.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class CreateRecordUseCase {
  constructor(@Inject('IRecordRepository') private readonly repository: IRecordRepository,
    private readonly processes: TherapeuticProcessExistsUseCase,
    private readonly domain: CreateRecordDomainService) {}

  async execute(dto: CreateRecordDto): Promise<CreateRecordResponseDto> {
    const now = new Date(Date.now()).toISOString()
    const entity = this.domain.create({
      id: randomUUID(), session_date: dto.session_date, attendance: dto.attendance,
      resume: dto.resume ?? null, tools: dto.tools ?? null, therapeutic_process: dto.therapeutic_process,
      created_at: now, updated_at: now,
    })
    if (!await this.processes.execute(entity.therapeutic_process)) throw new RecordProcessNotFoundError()
    const saved = await this.repository.create(entity)
    return {
      id: saved.pk, session_date: saved.session_date, attendance: saved.attendance,
      resume: saved.resume, tools: saved.tools, therapeutic_process: saved.therapeutic_process,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }
  }
}
