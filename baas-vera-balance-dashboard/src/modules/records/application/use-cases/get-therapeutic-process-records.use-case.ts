import { Inject, Injectable } from '@nestjs/common'
import type { IRecordRepository } from '../../domain/repositories/record.repository'
import type { GetTherapeuticProcessRecordsResponseDto } from '../dtos/get-therapeutic-process-records-response.dto'
import { TherapeuticProcessExistsUseCase } from '../../../therapeutic-processes/application/use-cases/therapeutic-process-exists.use-case'
import { RecordProcessNotFoundError } from '../../domain/errors/record.error'

@Injectable()
export class GetTherapeuticProcessRecordsUseCase {
  constructor(@Inject('IRecordRepository') private readonly repository: IRecordRepository,
    private readonly processes: TherapeuticProcessExistsUseCase) {}

  async execute(processId: string): Promise<GetTherapeuticProcessRecordsResponseDto[]> {
    if (!await this.processes.execute(processId)) throw new RecordProcessNotFoundError()
    const records = await this.repository.findByProcess(processId)
    return records.map(saved => ({
      id: saved.pk, session_date: saved.session_date, attendance: saved.attendance,
      resume: saved.resume, tools: saved.tools, therapeutic_process: saved.therapeutic_process,
      created_at: saved.created_at, updated_at: saved.updated_at,
    }))
  }
}
