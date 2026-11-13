import { ClinicEntity } from '../entities/clinic.entity'
import { ValidateCreateClinicDomainService } from './validate-create-clinic.domain-service'

export class CreateClinicDomainService {
  constructor(private readonly validator: ValidateCreateClinicDomainService) {}

  create(data: {
    id: string, name: string, logo: string | null, address: string, phone_number: string,
    therapy_types: string[], status: ClinicEntity['status'], created_at: string, updated_at: string,
  }): ClinicEntity {
    const entity = Object.assign(new ClinicEntity(), {
      pk: data.id, name: data.name, logo: data.logo, address: data.address, phone_number: data.phone_number,
      therapy_types: data.therapy_types, status: data.status, gsi1sk: `CLINIC#${data.id}`,
      created_at: data.created_at, updated_at: data.updated_at,
    })
    this.validator.execute(entity)
    entity.therapy_types = [...entity.therapy_types]
    entity.name = entity.name.trim()
    entity.address = entity.address.trim()
    entity.phone_number = entity.phone_number.trim()
    return entity
  }
}
