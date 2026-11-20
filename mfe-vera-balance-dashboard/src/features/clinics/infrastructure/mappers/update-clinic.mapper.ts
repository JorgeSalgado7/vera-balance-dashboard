import type { UpdateClinicDto } from '../../application/dtos/update-clinic.dto'
import type { ClinicChanges } from '../../domain/entities/clinic-changes.entity'

export const mapUpdateClinic = (changes: ClinicChanges): UpdateClinicDto => ({
  ...(changes.name !== undefined && { name: changes.name.trim() }),
  ...(changes.logo !== undefined && { logo: changes.logo?.trim() || null }),
  ...(changes.address !== undefined && { address: changes.address.trim() }),
  ...(changes.phoneNumber !== undefined && { phone_number: changes.phoneNumber.trim() }),
  ...(changes.status !== undefined && { status: changes.status }),
  ...(changes.therapyTypes !== undefined && { therapy_types: changes.therapyTypes }),
})
