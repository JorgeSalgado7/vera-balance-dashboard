import { Injectable } from '@nestjs/common'
import { ClinicModel } from '../models/clinic.model'
import { ClinicMapper } from '../../mappers/clinic.mapper'
import type { ClinicEntity } from '../../../domain/entities/clinic.entity'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import { ClinicConflictError } from '../../../domain/errors/clinic.error'

@Injectable()
export class CreateClinicDynamooseAdapter implements Pick<IClinicRepository, 'create'> {
  private readonly model = ClinicModel

  async create(entity: ClinicEntity): Promise<ClinicEntity> {
    try {
      await this.model.create(ClinicMapper.toPersistence(entity), { overwrite: false })
      return entity
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') throw new ClinicConflictError()
      throw error
    }
  }
}
