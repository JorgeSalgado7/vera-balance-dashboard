import type { ClinicTherapyResponseDto } from '../../application/dtos/clinic-therapy-response.dto'
import type { ClinicTherapy } from '../../domain/entities/clinic-therapy.entity'

export const mapClinicTherapy = (data: ClinicTherapyResponseDto): ClinicTherapy => ({
  id: data.id,
  name: data.name,
  icon: data.icon,
})
