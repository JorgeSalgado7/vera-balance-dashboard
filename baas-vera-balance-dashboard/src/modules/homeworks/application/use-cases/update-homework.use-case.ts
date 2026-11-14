import { GetRecordByIdUseCase } from '../../../records/application/use-cases/get-record-by-id.use-case'
import { Inject, Injectable } from '@nestjs/common'
import type { IHomeworkRepository } from '../../domain/repositories/homework.repository'
import type { UpdateHomeworkResponseDto } from '../dtos/update-homework-response.dto'
import { UpdateHomeworkDomainService } from '../../domain/services/update-homework.domain-service'
import type { UpdateHomeworkDto } from '../dtos/update-homework.dto'
import { HomeworkNotFoundError } from '../../domain/errors/homework.error'

@Injectable()
export class UpdateHomeworkUseCase {
  constructor(@Inject('IHomeworkRepository') private readonly repository: IHomeworkRepository,
    private readonly records: GetRecordByIdUseCase,
    private readonly domain: UpdateHomeworkDomainService) {}

  async execute(id: string, dto: UpdateHomeworkDto): Promise<UpdateHomeworkResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new HomeworkNotFoundError()
    const changes = this.domain.execute(entity, dto)
    const processId = entity.therapeutic_process ?? (await this.records.execute(entity.record)).therapeutic_process
    const saved = await this.repository.update(id, changes, new Date(Date.now()).toISOString())
    return {
      id: saved.pk, description: saved.description, record: saved.record, therapeutic_process: processId,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }
  }
}
