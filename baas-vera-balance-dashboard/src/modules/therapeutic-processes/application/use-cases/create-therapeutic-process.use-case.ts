import { Inject, Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../domain/repositories/therapeutic-process.repository'
import type { CreateTherapeuticProcessResponseDto } from '../dtos/create-therapeutic-process-response.dto'

import { ValidateTherapeuticProcessRelationsUseCase } from './validate-therapeutic-process-relations.use-case'
import { CreateTherapeuticProcessDomainService } from '../../domain/services/create-therapeutic-process.domain-service'
import type { CreateTherapeuticProcessDto } from '../dtos/create-therapeutic-process.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class CreateTherapeuticProcessUseCase {
  constructor(@Inject('ITherapeuticProcessRepository') private readonly repository: ITherapeuticProcessRepository,
    private readonly relations: ValidateTherapeuticProcessRelationsUseCase,
    private readonly domain: CreateTherapeuticProcessDomainService) {}

  async execute(dto: CreateTherapeuticProcessDto): Promise<CreateTherapeuticProcessResponseDto> {
    const now = new Date(Date.now()).toISOString()
    const entity = this.domain.create({ clinic: dto.clinic, therapy_type: dto.therapy_type, therapist: dto.therapist, patients: dto.patients, is_first_time: dto.is_first_time, consultation_reason: dto.consultation_reason, goals: dto.goals, status: dto.status, id: randomUUID(), created_at: now, updated_at: now })
    const related = await this.relations.execute(entity, now)
    const saved = await this.repository.create(entity)
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
