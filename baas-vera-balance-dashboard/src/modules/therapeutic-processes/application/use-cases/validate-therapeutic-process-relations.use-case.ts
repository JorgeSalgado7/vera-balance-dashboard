import { Injectable } from '@nestjs/common'
import { ClinicExistsUseCase } from '../../../clinics/application/use-cases/clinic-exists.use-case'
import { ResolveTherapeuticProcessRelationsUseCase } from './resolve-therapeutic-process-relations.use-case'
import { ValidateTherapyPatientsDomainService } from '../../domain/services/validate-therapy-patients.domain-service'
import type { TherapeuticProcessEntity } from '../../domain/entities/therapeutic-process.entity'
import type { ResolveTherapeuticProcessRelationsResponseDto } from '../dtos/resolve-therapeutic-process-relations-response.dto'
import { TherapeuticProcessReferenceNotFoundError } from '../../domain/errors/therapeutic-process.error'

@Injectable()
export class ValidateTherapeuticProcessRelationsUseCase {
  constructor(private readonly clinics: ClinicExistsUseCase, private readonly relations: ResolveTherapeuticProcessRelationsUseCase,
    private readonly domain: ValidateTherapyPatientsDomainService) {}

  async execute(entity: TherapeuticProcessEntity, now: string): Promise<ResolveTherapeuticProcessRelationsResponseDto> {
    if (!await this.clinics.execute(entity.clinic)) throw new TherapeuticProcessReferenceNotFoundError('clinic')
    const related = await this.relations.execute([entity])
    this.domain.execute(related.therapyTypes.find(item => item.id === entity.therapy_type)!.name, related.patients, now)
    return related
  }
}
