import type { HomeworkEntity } from '../entities/homework.entity'
import type { UpdateHomeworkDto } from '../../application/dtos/update-homework.dto'

export interface IHomeworkRepository {
  create(entity: HomeworkEntity): Promise<HomeworkEntity>
  findById(id: string): Promise<HomeworkEntity | null>
  findByRecord(recordId: string): Promise<HomeworkEntity[]>
  update(id: string, changes: UpdateHomeworkDto, updatedAt: string): Promise<HomeworkEntity>
}
