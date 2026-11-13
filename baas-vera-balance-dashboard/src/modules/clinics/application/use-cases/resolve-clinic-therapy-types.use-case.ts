import { Injectable } from '@nestjs/common'
import { FindTherapyTypesByIdsUseCase } from '../../../therapy-types/application/use-cases/find-therapy-types-by-ids.use-case'
import { InvalidClinicTherapyTypesError } from '../../domain/errors/clinic.error'

@Injectable()
export class ResolveClinicTherapyTypesUseCase {
  constructor(private readonly therapies: FindTherapyTypesByIdsUseCase) {}

  async execute(ids: string[]): Promise<Array<{ id: string, name: string, icon: string | null }>> {
    const found = await this.therapies.execute([...new Set(ids)])
    const indexed = new Map(found.map(item => [item.id, item]))
    return ids.map(id => {
      const therapy = indexed.get(id)
      if (!therapy) throw new InvalidClinicTherapyTypesError()
      return { id: therapy.id, name: therapy.name, icon: therapy.icon }
    })
  }
}
