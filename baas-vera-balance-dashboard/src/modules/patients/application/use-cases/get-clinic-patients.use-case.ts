import { Inject, Injectable } from '@nestjs/common'
import type { IPatientRepository } from '../../domain/repositories/patient.repository'
import type { GetClinicPatientsResponseDto } from '../dtos/get-clinic-patients-response.dto'
import { ClinicExistsUseCase } from '../../../clinics/application/use-cases/clinic-exists.use-case'
import { PatientClinicNotFoundError } from '../../domain/errors/patient.error'

@Injectable()
export class GetClinicPatientsUseCase {
  constructor(@Inject('IPatientRepository') private readonly repository: IPatientRepository,
    private readonly clinics: ClinicExistsUseCase) {}

  async execute(clinicId: string): Promise<GetClinicPatientsResponseDto[]> {
    if (!await this.clinics.execute(clinicId)) throw new PatientClinicNotFoundError()
    const patients = await this.repository.findByClinic(clinicId)
    return patients.map(saved => ({
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
    }))
  }
}
