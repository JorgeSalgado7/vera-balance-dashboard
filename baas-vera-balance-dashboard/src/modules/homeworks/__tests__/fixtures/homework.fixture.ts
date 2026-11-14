import { HomeworkEntity } from '../../domain/entities/homework.entity'
import type { IHomeworkRepository } from '../../domain/repositories/homework.repository'
import { GetRecordByIdUseCase } from '../../../records/application/use-cases/get-record-by-id.use-case'

export const input = { description: 'Practicar respiración durante cinco minutos.', record: 'record-id' }
export const now = '2026-11-13T12:00:00.000Z'
export function homeworkEntity(): HomeworkEntity {
  return Object.assign(new HomeworkEntity(), {
    pk: 'homework-id', sk: 'HOME_WORK', gsi1pk: 'HOME_WORK', gsi1sk: 'HOME_WORK#homework-id',
    gsi2pk: 'RECORD#record-id', gsi2sk: 'HOME_WORK#homework-id',
    ...input, therapeutic_process: 'process-id', created_at: now, updated_at: now,
  })
}
export function homeworkRepository() {
  return {
    create: jest.fn<ReturnType<IHomeworkRepository['create']>, Parameters<IHomeworkRepository['create']>>().mockImplementation(async entity => entity),
    findById: jest.fn<ReturnType<IHomeworkRepository['findById']>, Parameters<IHomeworkRepository['findById']>>().mockResolvedValue(homeworkEntity()),
    findByRecord: jest.fn<ReturnType<IHomeworkRepository['findByRecord']>, Parameters<IHomeworkRepository['findByRecord']>>().mockResolvedValue([homeworkEntity()]),
    update: jest.fn<ReturnType<IHomeworkRepository['update']>, Parameters<IHomeworkRepository['update']>>().mockImplementation(async (_id, changes, updatedAt) => ({ ...homeworkEntity(), ...changes, updated_at: updatedAt })),
  }
}
export function recordLookup() {
  const repository = { findById: jest.fn().mockResolvedValue({ pk: 'record-id', therapeutic_process: 'process-id' }) }
  return { repository, useCase: new GetRecordByIdUseCase(repository as never) }
}
