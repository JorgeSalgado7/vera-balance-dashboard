import { Injectable } from '@nestjs/common';
import { ClinicModel } from '../models/clinic.model';
import { ClinicMapper } from '../../mappers/clinic.mapper';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IUpdateClinicRepository } from '../../../domain/repositories/update-clinic.repository';

@Injectable()
export class UpdateClinicDynamooseAdapter implements IUpdateClinicRepository {
  private readonly model = ClinicModel;

  async update(entity: ClinicEntity): Promise<ClinicEntity> {
    const data = ClinicMapper.toPersistence(entity);
    const { pk, sk, ...updatableData } = data;
    await this.model.update( { pk, sk }, updatableData);
    return entity;
  }
}