import { Inject, Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../domain/repositories/therapeutic-process.repository'
import type { UpdateTherapeuticProcessResponseDto } from '../dtos/update-therapeutic-process-response.dto'
import { TherapeuticProcessNotFoundError } from '../../domain/errors/therapeutic-process.error'
import { ValidateTherapeuticProcessRelationsUseCase } from './validate-therapeutic-process-relations.use-case'
import { UpdateTherapeuticProcessDomainService } from '../../domain/services/update-therapeutic-process.domain-service'
import type { UpdateTherapeuticProcessDto } from '../dtos/update-therapeutic-process.dto'

@Injectable()
export class UpdateTherapeuticProcessUseCase {
  constructor(@Inject('ITherapeuticProcessRepository') private readonly repository: ITherapeuticProcessRepository,
    private readonly relations: ValidateTherapeuticProcessRelationsUseCase,
    private readonly domain: UpdateTherapeuticProcessDomainService) {}

  async execute(id: string, dto: UpdateTherapeuticProcessDto): Promise<UpdateTherapeuticProcessResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new TherapeuticProcessNotFoundError()
    const changes = this.domain.execute(entity, dto)
    const now = new Date(Date.now()).toISOString()
    const related = await this.relations.execute({ ...entity, ...changes }, now)
    const saved = await this.repository.update(entity, changes, now)
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
  }
}
