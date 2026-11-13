import { PatientEntity } from '../entities/patient.entity'
import { ValidatePatientDomainService } from './validate-patient.domain-service'

export class CreatePatientDomainService {
  constructor(private readonly validator: ValidatePatientDomainService) {}

  create(data: Pick<PatientEntity, 'clinic' | 'name' | 'birthday' | 'guardian' | 'phone_number' | 'gender' | 'educational_level' | 'occupation' | 'marital_status' | 'partner_data' | 'religion' | 'address' | 'created_at' | 'updated_at'> & { id: string }): PatientEntity {
    const entity = Object.assign(new PatientEntity(), {
      pk: data.id, clinic: data.clinic, name: data.name, birthday: data.birthday,
      guardian: data.guardian, phone_number: data.phone_number, gender: data.gender,
      educational_level: data.educational_level, occupation: data.occupation, marital_status: data.marital_status,
      partner_data: data.partner_data, religion: data.religion, address: data.address,
      gsi1sk: `PATIENT#${data.id}`, gsi2pk: `CLINIC#${data.clinic}`, gsi2sk: `PATIENT#${data.id}`,
      created_at: data.created_at, updated_at: data.updated_at,
    })
    this.validator.execute(entity)
    for (const field of ['name', 'occupation', 'religion', 'address'] as const) entity[field] = entity[field].trim()
    if (entity.guardian) entity.guardian = { ...entity.guardian }
    if (entity.partner_data) entity.partner_data = { ...entity.partner_data }
    return entity
  }
}
