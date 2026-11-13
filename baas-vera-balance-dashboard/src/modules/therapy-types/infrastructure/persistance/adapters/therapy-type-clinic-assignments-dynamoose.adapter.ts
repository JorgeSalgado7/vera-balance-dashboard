import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'

@Injectable()
export class TherapyTypeClinicAssignmentsDynamooseAdapter implements Pick<ITherapyTypeRepository, 'isAssignedToClinic'> {
  private readonly model = TherapyTypeModel

  async isAssignedToClinic(id: string): Promise<boolean> {
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = this.model.query('gsi1pk').eq('CLINIC').using('GSI1')
        .filter('therapy_types').contains(id).attributes(['pk']).limit(1)
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      if (items.length > 0) return true
      lastKey = items.lastKey
    } while (lastKey)
    return false
  }
}
