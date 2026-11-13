import type { PatientEntity } from '../entities/patient.entity'
import { InvalidPatientFieldError } from '../errors/patient.error'
import { GENDER, EDUCATIONAL_LEVEL, MARITAL_STATUS } from '../constants/patient-catalogs.constant'

export class ValidatePatientDomainService {
  execute(entity: PatientEntity): void {
    for (const field of ['clinic', 'name', 'occupation', 'religion', 'address'] as const) {
      if (typeof entity[field] !== 'string' || !entity[field].trim()) throw new InvalidPatientFieldError(field)
    }
    if (typeof entity.birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entity.birthday)) throw new InvalidPatientFieldError('birthday')
    const birthday = new Date(`${entity.birthday}T00:00:00.000Z`)
    if (Number.isNaN(birthday.getTime()) || birthday.toISOString().slice(0, 10) !== entity.birthday) throw new InvalidPatientFieldError('birthday')
    if (!GENDER.includes(entity.gender)) throw new InvalidPatientFieldError('gender')
    if (!EDUCATIONAL_LEVEL.includes(entity.educational_level)) throw new InvalidPatientFieldError('educational_level')
    if (!MARITAL_STATUS.includes(entity.marital_status)) throw new InvalidPatientFieldError('marital_status')
    if (entity.phone_number !== null && typeof entity.phone_number !== 'string') throw new InvalidPatientFieldError('phone_number')
    for (const field of ['guardian', 'partner_data'] as const) {
      const value = entity[field]
      if (value === null) continue
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InvalidPatientFieldError(field)
      const required = field === 'guardian' ? ['name', 'phone_number', 'relationship'] as const : ['name', 'relationship_time', 'occupation'] as const
      for (const key of Object.keys(value)) if (!(required as readonly string[]).includes(key)) throw new InvalidPatientFieldError(`${field}.${key}`)
      for (const key of required) {
        const text = (value as unknown as Record<string, unknown>)[key]
        if (typeof text !== 'string' || !text.trim()) throw new InvalidPatientFieldError(`${field}.${key}`)
      }
    }
  }
}
