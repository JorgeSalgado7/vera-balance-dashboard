import { TherapeuticProcessEntity } from '../entities/therapeutic-process.entity'
import { ValidateTherapeuticProcessDomainService } from './validate-therapeutic-process.domain-service'

export class CreateTherapeuticProcessDomainService {
  constructor(private readonly validator: ValidateTherapeuticProcessDomainService) {}

  create(data: Pick<TherapeuticProcessEntity, 'clinic' | 'therapy_type' | 'therapist' | 'patients' | 'is_first_time' | 'consultation_reason' | 'goals' | 'status' | 'created_at' | 'updated_at'> & { id: string }): TherapeuticProcessEntity {
    const entity = Object.assign(new TherapeuticProcessEntity(), {
      pk: data.id, clinic: data.clinic, therapy_type: data.therapy_type, therapist: data.therapist,
      patients: data.patients, is_first_time: data.is_first_time, consultation_reason: data.consultation_reason,
      goals: data.goals, status: data.status, created_at: data.created_at, updated_at: data.updated_at,
      gsi1sk: `THERAPEUTIC_PROCESS#${data.id}`, gsi2pk: `CLINIC#${data.clinic}`, gsi2sk: `THERAPEUTIC_PROCESS#${data.id}`,
      gsi3pk: `THERAPIST#${data.therapist}`, gsi3sk: `THERAPEUTIC_PROCESS#${data.id}`,
    })
    this.validator.execute(entity)
    entity.patients = [...entity.patients]
    entity.consultation_reason = entity.consultation_reason.trim()
    entity.goals = entity.goals.trim()
    return entity
  }
}
