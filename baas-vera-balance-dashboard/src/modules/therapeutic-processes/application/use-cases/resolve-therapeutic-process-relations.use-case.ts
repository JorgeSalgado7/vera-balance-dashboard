import { Injectable } from '@nestjs/common'
import { FindTherapyTypesByIdsUseCase } from '../../../therapy-types/application/use-cases/find-therapy-types-by-ids.use-case'
import { FindUsersByIdsUseCase } from '../../../users/application/use-cases/find-users-by-ids.use-case'
import { FindPatientsByIdsUseCase } from '../../../patients/application/use-cases/find-patients-by-ids.use-case'
import type { TherapeuticProcessEntity } from '../../domain/entities/therapeutic-process.entity'
import type { ResolveTherapeuticProcessRelationsResponseDto } from '../dtos/resolve-therapeutic-process-relations-response.dto'
import { TherapeuticProcessReferenceNotFoundError } from '../../domain/errors/therapeutic-process.error'

@Injectable()
export class ResolveTherapeuticProcessRelationsUseCase {
  constructor(private readonly therapyTypes: FindTherapyTypesByIdsUseCase,
    private readonly users: FindUsersByIdsUseCase, private readonly patients: FindPatientsByIdsUseCase) {}

  async execute(entities: TherapeuticProcessEntity[]): Promise<ResolveTherapeuticProcessRelationsResponseDto> {
    const therapyIds = [...new Set(entities.map(item => item.therapy_type))]
    const therapistIds = [...new Set(entities.map(item => item.therapist))]
    const patientIds = [...new Set(entities.flatMap(item => item.patients))]
    const [therapyTypes, therapists, patients] = await Promise.all([
      this.therapyTypes.execute(therapyIds), this.users.execute(therapistIds), this.patients.execute(patientIds),
    ])
    for (const [field, ids, found] of [['therapy_type', therapyIds, therapyTypes], ['therapist', therapistIds, therapists], ['patients', patientIds, patients]] as const) {
      const known = new Set(found.map(item => item.id))
      if (ids.some(id => !known.has(id))) throw new TherapeuticProcessReferenceNotFoundError(field)
    }
    return { therapyTypes, therapists, patients }
  }
}
