import { Inject, Injectable } from '@nestjs/common'
import type { IPatientRepository } from '../../domain/repositories/patient.repository'
import type { UpdatePatientResponseDto } from '../dtos/update-patient-response.dto'
import { PatientNotFoundError } from '../../domain/errors/patient.error'
import { UpdatePatientDomainService } from '../../domain/services/update-patient.domain-service'
import type { UpdatePatientDto } from '../dtos/update-patient.dto'

@Injectable()
export class UpdatePatientUseCase {
  constructor(@Inject('IPatientRepository') private readonly repository: IPatientRepository,
    private readonly domain: UpdatePatientDomainService) {}

  async execute(id: string, dto: UpdatePatientDto): Promise<UpdatePatientResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new PatientNotFoundError()
    const changes = this.domain.execute(entity, dto)
    const saved = await this.repository.update(entity, changes, new Date(Date.now()).toISOString())
    return {
      id: saved.pk,
      clinic: saved.clinic,
      name: saved.name,
      birthday: saved.birthday,
      guardian: saved.guardian,
      phone_number: saved.phone_number,
      gender: saved.gender,
      educational_level: saved.educational_level,
      occupation: saved.occupation,
      marital_status: saved.marital_status,
      partner_data: saved.partner_data,
      religion: saved.religion,
      address: saved.address,
      created_at: saved.created_at,
      updated_at: saved.updated_at
    }
  }
}
