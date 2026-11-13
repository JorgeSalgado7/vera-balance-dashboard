import type { ClinicEntity } from '../entities/clinic.entity'
import { InvalidClinicFieldError } from '../errors/clinic.error'

export class ValidateCreateClinicDomainService {
  execute(entity: ClinicEntity): void {
    for (const field of ['name', 'address', 'phone_number'] as const) {
      if (typeof entity[field] !== 'string' || !entity[field].trim()) throw new InvalidClinicFieldError(field)
    }
    if (entity.logo !== null && typeof entity.logo !== 'string') throw new InvalidClinicFieldError('logo')
    if (!Array.isArray(entity.therapy_types) || entity.therapy_types.some(id => typeof id !== 'string') ||
      new Set(entity.therapy_types).size !== entity.therapy_types.length) throw new InvalidClinicFieldError('therapy_types')
    if (!['Activo', 'Inactivo'].includes(entity.status)) throw new InvalidClinicFieldError('status')
  }
}
