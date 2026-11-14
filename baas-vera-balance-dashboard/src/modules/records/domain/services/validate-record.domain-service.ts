import type { RecordEntity } from '../entities/record.entity'
import { RECORD_ATTENDANCE } from '../constants/record-attendance.constant'
import { InvalidRecordFieldError } from '../errors/record.error'

export class ValidateRecordDomainService {
  execute(entity: RecordEntity): void {
    if (typeof entity.therapeutic_process !== 'string' || !entity.therapeutic_process.trim()) throw new InvalidRecordFieldError('therapeutic_process')
    if (!RECORD_ATTENDANCE.includes(entity.attendance)) throw new InvalidRecordFieldError('attendance')
    if (!this.isDateTime(entity.session_date)) throw new InvalidRecordFieldError('session_date')
    for (const field of ['resume', 'tools'] as const) {
      if (entity[field] !== null && typeof entity[field] !== 'string') throw new InvalidRecordFieldError(field)
    }
  }

  private isDateTime(value: string): boolean {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(5, 7))
    const day = Number(value.slice(8, 10))
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]! && Number.isFinite(Date.parse(value))
  }
}
