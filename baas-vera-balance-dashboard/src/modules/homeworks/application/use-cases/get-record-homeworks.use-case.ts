import { Inject, Injectable } from '@nestjs/common'
import type { IHomeworkRepository } from '../../domain/repositories/homework.repository'
import type { GetRecordHomeworksResponseDto } from '../dtos/get-record-homeworks-response.dto'
import { GetRecordByIdUseCase } from '../../../records/application/use-cases/get-record-by-id.use-case'

@Injectable()
export class GetRecordHomeworksUseCase {
  constructor(@Inject('IHomeworkRepository') private readonly repository: IHomeworkRepository,
    private readonly records: GetRecordByIdUseCase) {}

  async execute(recordId: string): Promise<GetRecordHomeworksResponseDto[]> {
    const record = await this.records.execute(recordId)
    const homeworks = await this.repository.findByRecord(recordId)
    return homeworks.map(saved => ({
      id: saved.pk, description: saved.description, record: saved.record, therapeutic_process: saved.therapeutic_process ?? record.therapeutic_process,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }))
  }
}
