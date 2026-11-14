import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'
import { Condition } from 'dynamoose'
import { TherapeuticProcessNotFoundError } from '../../../domain/errors/therapeutic-process.error'

@Injectable()
export class UpdateTherapeuticProcessStatusDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'updateStatus'> {
  async updateStatus(id: string, status: TherapeuticProcessEntity['status'], updatedAt: string): Promise<TherapeuticProcessEntity> {
    try {
      const item = await TherapeuticProcessModel.update({ pk: id, sk: 'THERAPEUTIC_PROCESS' },
        { $SET: { status, updated_at: updatedAt } }, { condition: new Condition().where('pk').exists(), returnValues: 'ALL_NEW' })
      return TherapeuticProcessMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') throw new TherapeuticProcessNotFoundError()
      throw error
    }
  }
}
