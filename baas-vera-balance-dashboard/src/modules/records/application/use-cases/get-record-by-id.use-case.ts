import { Inject, Injectable } from '@nestjs/common'
import type { IRecordRepository } from '../../domain/repositories/record.repository'
import type { GetRecordByIdResponseDto } from '../dtos/get-record-by-id-response.dto'
import { RecordNotFoundError } from '../../domain/errors/record.error'

@Injectable()
export class GetRecordByIdUseCase {
  constructor(@Inject('IRecordRepository') private readonly repository: IRecordRepository) {}

  async execute(id: string): Promise<GetRecordByIdResponseDto> {
    const saved = await this.repository.findById(id)
    if (!saved) throw new RecordNotFoundError()
    return {
      id: saved.pk, session_date: saved.session_date, attendance: saved.attendance,
      resume: saved.resume, tools: saved.tools, therapeutic_process: saved.therapeutic_process,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }
  }
}
