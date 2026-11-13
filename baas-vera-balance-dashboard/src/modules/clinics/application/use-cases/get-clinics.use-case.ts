import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'
import { ResolveClinicTherapyTypesUseCase } from './resolve-clinic-therapy-types.use-case'
import type { GetClinicsResponseDto } from '../dtos/get-clinics-response.dto'

@Injectable()
export class GetClinicsUseCase {
  constructor(@Inject('IClinicRepository') private readonly repository: IClinicRepository,
    private readonly therapies: ResolveClinicTherapyTypesUseCase) {}

  async execute(): Promise<GetClinicsResponseDto[]> {
    const clinics = await this.repository.findAll()
    const related = await this.therapies.execute([...new Set(clinics.flatMap(clinic => clinic.therapy_types))])
    const indexed = new Map(related.map(therapy => [therapy.id, therapy]))
    return clinics.map(saved => {
      const therapyTypes = saved.therapy_types.map(id => indexed.get(id)!)
      return {
        id: saved.pk,
        name: saved.name,
        logo: saved.logo,
        address: saved.address,
        phone_number: saved.phone_number,
        therapy_types: therapyTypes,
        status: saved.status,
        created_at: saved.created_at,
        updated_at: saved.updated_at,
      }
    })
  }
}
