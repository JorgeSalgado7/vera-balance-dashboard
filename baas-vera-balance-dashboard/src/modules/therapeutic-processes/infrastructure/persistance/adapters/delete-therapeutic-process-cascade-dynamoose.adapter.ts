import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'
import { Condition, transaction } from 'dynamoose'
import { PatientTherapeuticProcessModel } from '../models/patient-therapeutic-process.model'
import { TherapeuticProcessConflictError, TherapeuticProcessNotFoundError } from '../../../domain/errors/therapeutic-process.error'

@Injectable()
export class DeleteTherapeuticProcessCascadeDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'deleteCascade'> {
  async deleteCascade(entity: TherapeuticProcessEntity): Promise<void> {
    const key = { pk: entity.pk, sk: 'THERAPEUTIC_PROCESS' }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(entity.updated_at)
    try {
      const records = await this.findDependents(`THERAPEUTIC_PROCESS#${entity.pk}`, 'RECORD#')
      for (const record of records) {
        const tasks = await this.findDependents(`RECORD#${record.pk}`, 'HOME_WORK#')
        for (let offset = 0; offset < tasks.length; offset += 99) {
          await transaction([
            TherapeuticProcessModel.transaction.condition(key, condition),
            ...tasks.slice(offset, offset + 99).map(task => TherapeuticProcessModel.transaction.delete(task)),
          ])
        }
        await transaction([
          TherapeuticProcessModel.transaction.condition(key, condition),
          TherapeuticProcessModel.transaction.delete(record),
        ])
      }
      // Remove each patient relationship before the parent, retaining the parent if an earlier phase fails.
      for (let offset = 0; offset < entity.patients.length; offset += 99) {
        await transaction([
          TherapeuticProcessModel.transaction.condition(key, condition),
          ...entity.patients.slice(offset, offset + 99).map(id => PatientTherapeuticProcessModel.transaction.delete({ pk: `PATIENT#${id}`, sk: `THERAPEUTIC_PROCESS#${entity.pk}` })),
        ])
      }
      await transaction([TherapeuticProcessModel.transaction.delete(key, { condition })])
    } catch (error) {
      if (error instanceof Error && (error.name === 'TransactionCanceledException' || error.name === 'ConditionalCheckFailedException')) {
        if (!await TherapeuticProcessModel.get(key, { consistent: true })) throw new TherapeuticProcessNotFoundError()
        throw new TherapeuticProcessConflictError()
      }
      throw error
    }
  }

  private async findDependents(partition: string, prefix: string): Promise<Array<{ pk: string, sk: string }>> {
    const result: Array<{ pk: string, sk: string }> = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = TherapeuticProcessModel.query('gsi2pk').eq(partition).where('gsi2sk').beginsWith(prefix).using('GSI2').attributes(['pk', 'sk'])
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      result.push(...items.map(item => ({ pk: item.pk, sk: item.sk })))
      lastKey = items.lastKey
    } while (lastKey)
    return result
  }
}
