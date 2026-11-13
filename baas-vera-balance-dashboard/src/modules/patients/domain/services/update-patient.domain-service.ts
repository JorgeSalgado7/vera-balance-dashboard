import type { PatientEntity } from '../entities/patient.entity'
import { ValidatePatientDomainService } from './validate-patient.domain-service'
import { EmptyPatientUpdateError, InvalidPatientUpdateFieldsError } from '../errors/patient.error'

export class UpdatePatientDomainService {
  constructor(private readonly validator: ValidatePatientDomainService) {}

  execute(entity: PatientEntity, input: Partial<Pick<PatientEntity, 'name' | 'birthday' | 'guardian' | 'phone_number' | 'gender' | 'educational_level' | 'occupation' | 'marital_status' | 'partner_data' | 'religion' | 'address'>>) {
    const allowed = ['name', 'birthday', 'guardian', 'phone_number', 'gender', 'educational_level', 'occupation', 'marital_status', 'partner_data', 'religion', 'address'] as const
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmptyPatientUpdateError()
    const invalid = Object.keys(input).filter(field => !(allowed as readonly string[]).includes(field))
    if (invalid.length) throw new InvalidPatientUpdateFieldsError(invalid)
    const changes: typeof input = {}
    for (const field of allowed) if (input[field] !== undefined) Object.assign(changes, { [field]: input[field] })
    if (!Object.keys(changes).length) throw new EmptyPatientUpdateError()
    this.validator.execute({ ...entity, ...changes })
    for (const field of ['name', 'occupation', 'religion', 'address'] as const) if (changes[field] !== undefined) changes[field] = changes[field].trim()
    if (changes.guardian) changes.guardian = { ...changes.guardian }
    if (changes.partner_data) changes.partner_data = { ...changes.partner_data }
    return changes
  }
}
