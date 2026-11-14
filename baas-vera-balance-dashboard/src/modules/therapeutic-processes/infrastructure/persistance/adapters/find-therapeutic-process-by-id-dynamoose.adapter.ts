import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'

@Injectable()
export class FindTherapeuticProcessByIdDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'findById'> {
  async findById(id: string): Promise<TherapeuticProcessEntity | null> {
    const item = await TherapeuticProcessModel.get({ pk: id, sk: 'THERAPEUTIC_PROCESS' }, { consistent: true })
    return item ? TherapeuticProcessMapper.toEntity(item) : null
  }
}
