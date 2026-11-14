import { GetRecordByIdUseCase } from '../../../records/application/use-cases/get-record-by-id.use-case'
import { Inject, Injectable } from '@nestjs/common'
import type { IHomeworkRepository } from '../../domain/repositories/homework.repository'
import type { GetHomeworkByIdResponseDto } from '../dtos/get-homework-by-id-response.dto'
import { HomeworkNotFoundError } from '../../domain/errors/homework.error'

@Injectable()
export class GetHomeworkByIdUseCase {
  constructor(@Inject('IHomeworkRepository') private readonly repository: IHomeworkRepository,
    private readonly records: GetRecordByIdUseCase) {}

  async execute(id: string): Promise<GetHomeworkByIdResponseDto> {
    const saved = await this.repository.findById(id)
    if (!saved) throw new HomeworkNotFoundError()
    const processId = saved.therapeutic_process ?? (await this.records.execute(saved.record)).therapeutic_process
    return {
      id: saved.pk, description: saved.description, record: saved.record, therapeutic_process: processId,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }
  }
}
