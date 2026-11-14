import type { FindTherapyTypesByIdsResponseDto } from '../../../therapy-types/application/dtos/find-therapy-types-by-ids-response.dto'
import type { FindUsersByIdsResponseDto } from '../../../users/application/dtos/find-users-by-ids-response.dto'
import type { FindPatientsByIdsResponseDto } from '../../../patients/application/dtos/find-patients-by-ids-response.dto'

export class ResolveTherapeuticProcessRelationsResponseDto {
  therapyTypes!: FindTherapyTypesByIdsResponseDto[]
  therapists!: FindUsersByIdsResponseDto[]
  patients!: FindPatientsByIdsResponseDto[]
}
