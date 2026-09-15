import { Injectable } from '@nestjs/common';
import { ClinicModel } from '../models/clinic.model';
import { ClinicMapper } from '../../mappers/clinic.mapper';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { ICreateClinicRepository } from '../../../domain/repositories/create-clinic.repository';

@Injectable()
export class CreateClinicDynamooseAdapter implements ICreateClinicRepository {
  private readonly model = ClinicModel;

  async create(entity: ClinicEntity): Promise<ClinicEntity> {
    const data = ClinicMapper.toPersistence(entity);
    await this.model.create(data);
    return entity;
  }
}