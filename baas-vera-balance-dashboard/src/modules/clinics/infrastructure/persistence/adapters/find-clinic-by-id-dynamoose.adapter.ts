import { Injectable } from '@nestjs/common';
import { ClinicModel } from '../models/clinic.model';
import { ClinicMapper } from '../../mappers/clinic.mapper';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IFindClinicByIdRepository } from '../../../domain/repositories/find-clinic-by-id.repository';
import type { ClinicPersistence } from '../interfaces/clinic-persistence.interface';

@Injectable()
export class FindClinicByIdDynamooseAdapter implements IFindClinicByIdRepository {
  private readonly model = ClinicModel;

  async findById(clinicId: string): Promise<ClinicEntity | null> {
    const item = await this.model.get({ pk: clinicId, sk: 'CLINIC' });

    if (!item) {
      return null;
    }

    return ClinicMapper.toEntity(
      item as unknown as ClinicPersistence
    );
  }
}