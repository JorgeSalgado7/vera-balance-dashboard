import { Inject, Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../domain/repositories/therapeutic-process.repository'
import type { UpdateTherapeuticProcessStatusResponseDto } from '../dtos/update-therapeutic-process-status-response.dto'
import { InvalidTherapeuticProcessFieldError } from '../../domain/errors/therapeutic-process.error'
import { ResolveTherapeuticProcessRelationsUseCase } from './resolve-therapeutic-process-relations.use-case'
import type { UpdateTherapeuticProcessStatusDto } from '../dtos/update-therapeutic-process-status.dto'
import { THERAPEUTIC_PROCESS_STATUS } from '../../domain/constants/therapeutic-process-status.constant'

@Injectable()
export class UpdateTherapeuticProcessStatusUseCase {
  constructor(@Inject('ITherapeuticProcessRepository') private readonly repository: ITherapeuticProcessRepository,
    private readonly relations: ResolveTherapeuticProcessRelationsUseCase) {}

  async execute(id: string, dto: UpdateTherapeuticProcessStatusDto): Promise<UpdateTherapeuticProcessStatusResponseDto> {
    if (!THERAPEUTIC_PROCESS_STATUS.includes(dto.status)) throw new InvalidTherapeuticProcessFieldError('status')
    const saved = await this.repository.updateStatus(id, dto.status, new Date(Date.now()).toISOString())
    const related = await this.relations.execute([saved])
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
