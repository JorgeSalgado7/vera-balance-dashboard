import { Inject, Injectable } from '@nestjs/common'
import type { IPatientRepository } from '../../domain/repositories/patient.repository'
import type { FindPatientsByIdsResponseDto } from '../dtos/find-patients-by-ids-response.dto'

@Injectable()
export class FindPatientsByIdsUseCase {
  constructor(@Inject('IPatientRepository') private readonly repository: Pick<IPatientRepository, 'findByIds'>) {}

  async execute(ids: string[]): Promise<FindPatientsByIdsResponseDto[]> {
    return (await this.repository.findByIds(ids)).map(entity => ({
      id: entity.pk,
      clinic: entity.clinic,
      name: entity.name,
      birthday: entity.birthday,
      guardian: entity.guardian,
      phone_number: entity.phone_number,
      gender: entity.gender,
      educational_level: entity.educational_level,
      occupation: entity.occupation,
      marital_status: entity.marital_status,
      partner_data: entity.partner_data,
      religion: entity.religion,
      address: entity.address,
      created_at: entity.created_at,
      updated_at: entity.updated_at
    }))
  }
}
