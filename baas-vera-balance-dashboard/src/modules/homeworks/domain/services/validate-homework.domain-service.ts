import type { HomeworkEntity } from '../entities/homework.entity'
import { InvalidHomeworkFieldError } from '../errors/homework.error'

export class ValidateHomeworkDomainService {
  execute(entity: HomeworkEntity): void {
    for (const field of ['description', 'record'] as const) {
      if (typeof entity[field] !== 'string' || !entity[field].trim()) throw new InvalidHomeworkFieldError(field)
    }
  }
}
