import type { UpdateClinicRepository } from '../../domain/repositories/update-clinic.repository'
import type { ClinicChanges } from '../../domain/entities/clinic-changes.entity'
import type { ClinicResponseDto } from '../../application/dtos/clinic-response.dto'
import { api } from '../../../../infrastructure/http/api'
import { mapClinic } from '../mappers/clinic.mapper'
import { mapUpdateClinic } from '../mappers/update-clinic.mapper'

export class UpdateClinicAdapter implements UpdateClinicRepository {
  async execute(clinicId: string, changes: ClinicChanges) {
    const { data } = await api.patch<ClinicResponseDto>(`/clinics/${encodeURIComponent(clinicId)}`, mapUpdateClinic(changes))
    return mapClinic(data)
  }
}
