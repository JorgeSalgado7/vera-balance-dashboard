import type { TherapeuticProcessEntity } from '../entities/therapeutic-process.entity'
import { ValidateTherapeuticProcessDomainService } from './validate-therapeutic-process.domain-service'
import { EmptyTherapeuticProcessUpdateError, InvalidTherapeuticProcessUpdateFieldsError } from '../errors/therapeutic-process.error'

export class UpdateTherapeuticProcessDomainService {
  constructor(private readonly validator: ValidateTherapeuticProcessDomainService) {}

  execute(entity: TherapeuticProcessEntity, input: Partial<Pick<TherapeuticProcessEntity, 'therapy_type' | 'therapist' | 'patients' | 'is_first_time' | 'consultation_reason' | 'goals'>>) {
    const allowed = ['therapy_type', 'therapist', 'patients', 'is_first_time', 'consultation_reason', 'goals'] as const
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmptyTherapeuticProcessUpdateError()
    const invalid = Object.keys(input).filter(field => !(allowed as readonly string[]).includes(field))
    if (invalid.length) throw new InvalidTherapeuticProcessUpdateFieldsError(invalid)
    const changes: typeof input = {}
    for (const field of allowed) if (input[field] !== undefined) Object.assign(changes, { [field]: input[field] })
    if (!Object.keys(changes).length) throw new EmptyTherapeuticProcessUpdateError()
    this.validator.execute({ ...entity, ...changes })
    if (changes.patients) changes.patients = [...changes.patients]
    if (changes.consultation_reason !== undefined) changes.consultation_reason = changes.consultation_reason.trim()
    if (changes.goals !== undefined) changes.goals = changes.goals.trim()
    return changes
  }
}
