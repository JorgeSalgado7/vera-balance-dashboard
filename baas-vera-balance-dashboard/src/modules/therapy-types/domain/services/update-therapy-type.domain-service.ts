import { EmptyTherapyTypeUpdateError } from '../errors/therapy-type.error'
import type { TherapyTypeEntity } from '../entities/therapy-type.entity'

export class UpdateTherapyTypeDomainService {
  execute(input: Partial<Pick<TherapyTypeEntity, 'name' | 'icon'>>) {
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
      (input.name === undefined && input.icon === undefined)) throw new EmptyTherapyTypeUpdateError()
    return input
  }
}
