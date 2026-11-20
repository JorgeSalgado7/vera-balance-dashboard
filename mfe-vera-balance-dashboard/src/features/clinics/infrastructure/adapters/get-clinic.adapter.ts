import type { GetClinicRepository } from '../../domain/repositories/get-clinic.repository'
import type { ClinicResponseDto } from '../../application/dtos/clinic-response.dto'
import { api } from '../../../../infrastructure/http/api'
import { mapClinic } from '../mappers/clinic.mapper'

export class GetClinicAdapter implements GetClinicRepository {
  async execute(clinicId: string) {
    const { data } = await api.get<ClinicResponseDto>(`/clinics/${encodeURIComponent(clinicId)}`)
    return mapClinic(data)
  }
}
