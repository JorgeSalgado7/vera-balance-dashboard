import type { UpdateClinicTherapistRepository } from '../../domain/repositories/update-clinic-therapist.repository'
import type { ClinicTherapistChanges } from '../../domain/entities/clinic-therapist-changes.entity'
import type { ClinicTherapistResponseDto } from '../../application/dtos/clinic-therapist-response.dto'
import type { UpdateClinicTherapistDto } from '../../application/dtos/update-clinic-therapist.dto'
import { api } from '../../../../infrastructure/http/api'
import { mapClinicTherapist } from '../mappers/clinic-therapist.mapper'

export class UpdateClinicTherapistAdapter implements UpdateClinicTherapistRepository {
  async execute(userId: string, changes: ClinicTherapistChanges) {
    const body: UpdateClinicTherapistDto = {
      name: changes.name.trim(),
      role: changes.role,
      professional_license: changes.professionalLicense.trim(),
    }
    const { data } = await api.patch<ClinicTherapistResponseDto>(`/users/${encodeURIComponent(userId)}`, body)
    return mapClinicTherapist(data)
  }
}
