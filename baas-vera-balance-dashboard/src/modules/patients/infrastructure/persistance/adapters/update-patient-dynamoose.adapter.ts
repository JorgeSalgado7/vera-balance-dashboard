import { Injectable } from '@nestjs/common'
import { PatientModel } from '../models/patient.model'
import { PatientMapper } from '../../mappers/patient.mapper'
import type { PatientEntity } from '../../../domain/entities/patient.entity'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'
import { Condition } from 'dynamoose'
import type { UpdatePatientDto } from '../../../application/dtos/update-patient.dto'
import { PatientUpdateConflictError, PatientNotFoundError } from '../../../domain/errors/patient.error'

@Injectable()
export class UpdatePatientDynamooseAdapter implements Pick<IPatientRepository, 'update'> {
  private readonly model = PatientModel

  async update(entity: PatientEntity, changes: UpdatePatientDto, updatedAt: string): Promise<PatientEntity> {
    const key = { pk: entity.pk, sk: 'PATIENT' }
    const set: Record<string, unknown> = { updated_at: updatedAt }
    for (const field of ['name', 'birthday', 'guardian', 'phone_number', 'gender', 'educational_level', 'occupation', 'marital_status', 'partner_data', 'religion', 'address'] as const) {
      if (changes[field] !== undefined) set[field] = changes[field]
    }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(entity.updated_at)
    try {
      const item = await this.model.update(key, { $SET: set }, { condition, returnValues: 'ALL_NEW' })
      return PatientMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        if (!await this.model.get(key, { consistent: true })) throw new PatientNotFoundError()
        throw new PatientUpdateConflictError()
      }
      throw error
    }
  }
}
