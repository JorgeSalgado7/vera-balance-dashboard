import type { RecordEntity } from '../entities/record.entity'
import type { UpdateRecordDto } from '../../application/dtos/update-record.dto'

export interface IRecordRepository {
  create(entity: RecordEntity): Promise<RecordEntity>
  findById(id: string): Promise<RecordEntity | null>
  findByProcess(processId: string): Promise<RecordEntity[]>
  update(id: string, changes: UpdateRecordDto, updatedAt: string): Promise<RecordEntity>
}
