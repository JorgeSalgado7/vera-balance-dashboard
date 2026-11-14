import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'
import { Condition, transaction } from 'dynamoose'
import type { UpdateTherapeuticProcessDto } from '../../../application/dtos/update-therapeutic-process.dto'
import { PatientTherapeuticProcessModel } from '../models/patient-therapeutic-process.model'
import { TherapeuticProcessConflictError, TherapeuticProcessNotFoundError, TherapeuticProcessTransactionLimitError } from '../../../domain/errors/therapeutic-process.error'

@Injectable()
export class UpdateTherapeuticProcessDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'update'> {
  async update(entity: TherapeuticProcessEntity, changes: UpdateTherapeuticProcessDto, updatedAt: string): Promise<TherapeuticProcessEntity> {
    const next = { ...entity, ...changes, updated_at: updatedAt }
    const previousPatients = new Set(entity.patients)
    const nextPatients = new Set(next.patients)
    const added = next.patients.filter(id => !previousPatients.has(id))
    const removed = entity.patients.filter(id => !nextPatients.has(id))
    if (1 + added.length + removed.length > 100) throw new TherapeuticProcessTransactionLimitError()
    const set: Record<string, unknown> = { ...changes, updated_at: updatedAt }
    if (changes.therapist !== undefined) { set.gsi3pk = `THERAPIST#${changes.therapist}`; next.gsi3pk = String(set.gsi3pk) }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(entity.updated_at)
    try {
      await transaction([
        TherapeuticProcessModel.transaction.update({ pk: entity.pk, sk: 'THERAPEUTIC_PROCESS' }, { $SET: set }, { condition }),
        ...added.map(id => PatientTherapeuticProcessModel.transaction.create({ pk: `PATIENT#${id}`, sk: `THERAPEUTIC_PROCESS#${entity.pk}`, created_at: updatedAt, updated_at: updatedAt }, { overwrite: false })),
        ...removed.map(id => PatientTherapeuticProcessModel.transaction.delete({ pk: `PATIENT#${id}`, sk: `THERAPEUTIC_PROCESS#${entity.pk}` })),
      ])
      return Object.assign(next, { patients: [...next.patients] })
    } catch (error) {
      if (error instanceof Error && (error.name === 'TransactionCanceledException' || error.name === 'ConditionalCheckFailedException')) {
        if (!await TherapeuticProcessModel.get({ pk: entity.pk, sk: 'THERAPEUTIC_PROCESS' }, { consistent: true })) throw new TherapeuticProcessNotFoundError()
        throw new TherapeuticProcessConflictError()
      }
      throw error
    }
  }
}
