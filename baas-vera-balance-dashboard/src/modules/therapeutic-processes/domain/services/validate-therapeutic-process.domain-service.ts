import type { TherapeuticProcessEntity } from '../entities/therapeutic-process.entity'
import { THERAPEUTIC_PROCESS_STATUS } from '../constants/therapeutic-process-status.constant'
import { InvalidTherapeuticProcessFieldError } from '../errors/therapeutic-process.error'

export class ValidateTherapeuticProcessDomainService {
  execute(entity: TherapeuticProcessEntity): void {
    for (const field of ['clinic', 'therapy_type', 'therapist', 'consultation_reason', 'goals'] as const) {
      if (typeof entity[field] !== 'string' || !entity[field].trim()) throw new InvalidTherapeuticProcessFieldError(field)
    }
    if (typeof entity.is_first_time !== 'boolean') throw new InvalidTherapeuticProcessFieldError('is_first_time')
    if (!Array.isArray(entity.patients) || entity.patients.length === 0 || entity.patients.some(id => typeof id !== 'string' || !id.trim()) || new Set(entity.patients).size !== entity.patients.length) throw new InvalidTherapeuticProcessFieldError('patients')
    if (!THERAPEUTIC_PROCESS_STATUS.includes(entity.status)) throw new InvalidTherapeuticProcessFieldError('status')
  }
}
