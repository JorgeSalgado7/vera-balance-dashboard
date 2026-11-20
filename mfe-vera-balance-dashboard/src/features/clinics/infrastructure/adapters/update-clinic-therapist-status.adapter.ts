import type { UpdateClinicTherapistStatusRepository } from '../../domain/repositories/update-clinic-therapist-status.repository'
import type { ClinicTherapist } from '../../domain/entities/clinic-therapist.entity'
import type { ClinicTherapistResponseDto } from '../../application/dtos/clinic-therapist-response.dto'
import type { UpdateClinicTherapistStatusDto } from '../../application/dtos/update-clinic-therapist-status.dto'
import { api } from '../../../../infrastructure/http/api'
import { mapClinicTherapist } from '../mappers/clinic-therapist.mapper'

export class UpdateClinicTherapistStatusAdapter implements UpdateClinicTherapistStatusRepository {
  async execute(userId: string, status: ClinicTherapist['status']) {
    const body: UpdateClinicTherapistStatusDto = { status }
    const { data } = await api.patch<ClinicTherapistResponseDto>(`/users/${encodeURIComponent(userId)}/status`, body)
    return mapClinicTherapist(data)
  }
}
