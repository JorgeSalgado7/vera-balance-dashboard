import { Injectable } from '@nestjs/common'
import { ClinicModel } from '../models/clinic.model'
import { ClinicMapper } from '../../mappers/clinic.mapper'
import type { ClinicEntity } from '../../../domain/entities/clinic.entity'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import { Condition } from 'dynamoose'
import type { UpdateClinicDto } from '../../../application/dtos/update-clinic.dto'
import { ClinicConflictError, ClinicNotFoundError } from '../../../domain/errors/clinic.error'

@Injectable()
export class UpdateClinicDynamooseAdapter implements Pick<IClinicRepository, 'update'> {
  private readonly model = ClinicModel

  async update(entity: ClinicEntity, changes: UpdateClinicDto, updatedAt: string): Promise<ClinicEntity> {
    const key = { pk: entity.pk, sk: 'CLINIC' }
    const set: Record<string, unknown> = { updated_at: updatedAt }
    for (const field of ['name', 'logo', 'address', 'phone_number', 'therapy_types', 'status'] as const) {
      if (changes[field] !== undefined) set[field] = changes[field]
    }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(entity.updated_at)
    try {
      const item = await this.model.update(key, { $SET: set }, { condition, returnValues: 'ALL_NEW' })
      return ClinicMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        if (!await this.model.get(key, { consistent: true })) throw new ClinicNotFoundError()
        throw new ClinicConflictError()
      }
      throw error
    }
  }
}
