import type { CreateRecordDto } from '../../application/dtos/create-record.dto'
import { RecordEntity } from '../../domain/entities/record.entity'

export const input: CreateRecordDto = { session_date: '2026-11-13T10:30:00.000Z', attendance: 'Asistida', therapeutic_process: 'process-id' }
export const now = '2026-11-13T12:00:00.000Z'
export function recordEntity(): RecordEntity {
  return Object.assign(new RecordEntity(), {
    pk: 'record-id', sk: 'RECORD', gsi1pk: 'RECORD', gsi1sk: 'RECORD#record-id',
    gsi2pk: 'THERAPEUTIC_PROCESS#process-id', gsi2sk: 'RECORD#record-id',
    ...input, resume: null, tools: null, created_at: now, updated_at: now,
  })
}
export function recordRepository() {
  return { create: jest.fn(async (entity: RecordEntity) => entity), findById: jest.fn().mockResolvedValue(recordEntity()),
    findByProcess: jest.fn().mockResolvedValue([recordEntity()]), update: jest.fn(async (_id, changes, updatedAt) => ({ ...recordEntity(), ...changes, updated_at: updatedAt })) }
}
