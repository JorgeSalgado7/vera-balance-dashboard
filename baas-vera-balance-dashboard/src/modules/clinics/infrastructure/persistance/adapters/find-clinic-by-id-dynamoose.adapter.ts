import { Injectable } from '@nestjs/common'
import { ClinicModel } from '../models/clinic.model'
import { ClinicMapper } from '../../mappers/clinic.mapper'
import type { ClinicEntity } from '../../../domain/entities/clinic.entity'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'

@Injectable()
export class FindClinicByIdDynamooseAdapter implements Pick<IClinicRepository, 'findById'> {
  private readonly model = ClinicModel

  async findById(id: string): Promise<ClinicEntity | null> {
    const item = await this.model.get({ pk: id, sk: 'CLINIC' }, { consistent: true })
    return item ? ClinicMapper.toEntity(item) : null
  }
}
