import { Inject, Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../domain/repositories/therapeutic-process.repository'
import type { GetPatientTherapeuticProcessesResponseDto } from '../dtos/get-patient-therapeutic-processes-response.dto'
import { TherapeuticProcessReferenceNotFoundError } from '../../domain/errors/therapeutic-process.error'
import { ResolveTherapeuticProcessRelationsUseCase } from './resolve-therapeutic-process-relations.use-case'
import { FindPatientsByIdsUseCase } from '../../../patients/application/use-cases/find-patients-by-ids.use-case'

@Injectable()
export class GetPatientTherapeuticProcessesUseCase {
  constructor(@Inject('ITherapeuticProcessRepository') private readonly repository: ITherapeuticProcessRepository,
    private readonly relations: ResolveTherapeuticProcessRelationsUseCase,
    private readonly patients: FindPatientsByIdsUseCase) {}

  async execute(patientId: string): Promise<GetPatientTherapeuticProcessesResponseDto[]> {
    if (!(await this.patients.execute([patientId])).some(item => item.id === patientId)) throw new TherapeuticProcessReferenceNotFoundError('patient')
    const entities = await this.repository.findByPatient(patientId)
    const related = await this.relations.execute(entities)
    return entities.map(saved => {
      const therapy = related.therapyTypes.find(item => item.id === saved.therapy_type)!
      const therapist = related.therapists.find(item => item.id === saved.therapist)!
      return {
        id: saved.pk, clinic: saved.clinic,
        therapy_type: { id: therapy.id, name: therapy.name, icon: therapy.icon },
        therapist: { id: therapist.id, name: therapist.name, professional_license: therapist.professional_license },
        patients: saved.patients.map(id => { const patient = related.patients.find(item => item.id === id)!; return { id: patient.id, name: patient.name } }),
        is_first_time: saved.is_first_time, consultation_reason: saved.consultation_reason, goals: saved.goals,
        status: saved.status, created_at: saved.created_at, updated_at: saved.updated_at,
      }
    })
  }
}
