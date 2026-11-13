import type { ClinicEntity } from '../entities/clinic.entity'
import { EmptyClinicUpdateError, InvalidClinicUpdateFieldsError } from '../errors/clinic.error'
import { ValidateCreateClinicDomainService } from './validate-create-clinic.domain-service'

export class UpdateClinicDomainService {
  constructor(private readonly validator: ValidateCreateClinicDomainService) {}

  execute(entity: ClinicEntity, input: Partial<Pick<ClinicEntity, 'name' | 'logo' | 'address' | 'phone_number' | 'therapy_types' | 'status'>>) {
    const allowed = ['name', 'logo', 'address', 'phone_number', 'therapy_types', 'status'] as const
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmptyClinicUpdateError()
    const invalid = Object.keys(input).filter(field => !allowed.includes(field as typeof allowed[number]))
    if (invalid.length) throw new InvalidClinicUpdateFieldsError(invalid)
    const changes: typeof input = {}
    for (const field of allowed) {
      if (input[field] !== undefined) Object.assign(changes, { [field]: input[field] })
    }
    if (!Object.keys(changes).length) throw new EmptyClinicUpdateError()
    this.validator.execute({ ...entity, ...changes })
    if (changes.name !== undefined) changes.name = changes.name.trim()
    if (changes.address !== undefined) changes.address = changes.address.trim()
    if (changes.phone_number !== undefined) changes.phone_number = changes.phone_number.trim()
    return changes
  }
}
