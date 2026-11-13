import { Inject, Injectable } from '@nestjs/common'
import type { IPatientRepository } from '../../domain/repositories/patient.repository'
import type { CreatePatientResponseDto } from '../dtos/create-patient-response.dto'
import { ClinicExistsUseCase } from '../../../clinics/application/use-cases/clinic-exists.use-case'
import { PatientClinicNotFoundError } from '../../domain/errors/patient.error'
import { CreatePatientDomainService } from '../../domain/services/create-patient.domain-service'
import type { CreatePatientDto } from '../dtos/create-patient.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class CreatePatientUseCase {
  constructor(@Inject('IPatientRepository') private readonly repository: IPatientRepository,
    private readonly clinics: ClinicExistsUseCase,
    private readonly domain: CreatePatientDomainService) {}

  async execute(dto: CreatePatientDto): Promise<CreatePatientResponseDto> {
    const now = new Date(Date.now()).toISOString()
    const entity = this.domain.create({
      clinic: dto.clinic,
      name: dto.name,
      birthday: dto.birthday,
      guardian: dto.guardian ?? null,
      phone_number: dto.phone_number ?? null,
      gender: dto.gender,
      educational_level: dto.educational_level,
      occupation: dto.occupation,
      marital_status: dto.marital_status,
      partner_data: dto.partner_data ?? null,
      religion: dto.religion,
      address: dto.address,
      id: randomUUID(), created_at: now, updated_at: now,
    })
    if (!await this.clinics.execute(entity.clinic)) throw new PatientClinicNotFoundError()
    const saved = await this.repository.create(entity)
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
