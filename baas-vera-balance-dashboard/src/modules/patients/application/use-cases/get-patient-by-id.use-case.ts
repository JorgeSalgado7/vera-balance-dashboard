import { Inject, Injectable } from '@nestjs/common'
import type { IPatientRepository } from '../../domain/repositories/patient.repository'
import type { GetPatientByIdResponseDto } from '../dtos/get-patient-by-id-response.dto'
import { PatientNotFoundError } from '../../domain/errors/patient.error'

@Injectable()
export class GetPatientByIdUseCase {
  constructor(@Inject('IPatientRepository') private readonly repository: IPatientRepository) {}

  async execute(id: string): Promise<GetPatientByIdResponseDto> {
    const saved = await this.repository.findById(id)
    if (!saved) throw new PatientNotFoundError()
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
