import type { GetClinicTherapistsRepository } from '../../domain/repositories/get-clinic-therapists.repository'
import type { ClinicTherapistResponseDto } from '../../application/dtos/clinic-therapist-response.dto'
import { api } from '../../../../infrastructure/http/api'
import { mapClinicTherapist } from '../mappers/clinic-therapist.mapper'

export class GetClinicTherapistsAdapter implements GetClinicTherapistsRepository {
  async execute(clinicId: string) {
    const { data } = await api.get<ClinicTherapistResponseDto[]>(`/clinics/${encodeURIComponent(clinicId)}/therapists`)
    return data.map(mapClinicTherapist)
  }
}
