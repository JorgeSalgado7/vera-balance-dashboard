import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'
import { transaction } from 'dynamoose'
import { PatientTherapeuticProcessModel } from '../models/patient-therapeutic-process.model'
import { TherapeuticProcessConflictError, TherapeuticProcessTransactionLimitError } from '../../../domain/errors/therapeutic-process.error'

@Injectable()
export class CreateTherapeuticProcessDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'create'> {
  async create(entity: TherapeuticProcessEntity): Promise<TherapeuticProcessEntity> {
    if (entity.patients.length + 1 > 100) throw new TherapeuticProcessTransactionLimitError()
    try {
      await transaction([
        TherapeuticProcessModel.transaction.create(TherapeuticProcessMapper.toPersistence(entity), { overwrite: false }),
        ...entity.patients.map(id => PatientTherapeuticProcessModel.transaction.create({
          pk: `PATIENT#${id}`, sk: `THERAPEUTIC_PROCESS#${entity.pk}`, created_at: entity.created_at, updated_at: entity.updated_at,
        }, { overwrite: false })),
      ])
      return entity
    } catch (error) {
      if (error instanceof Error && (error.name === 'TransactionCanceledException' || error.name === 'ConditionalCheckFailedException')) throw new TherapeuticProcessConflictError()
      throw error
    }
  }
}
