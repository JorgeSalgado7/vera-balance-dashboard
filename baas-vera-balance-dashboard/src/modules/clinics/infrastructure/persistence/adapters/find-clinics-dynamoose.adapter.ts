import { Injectable } from '@nestjs/common';
import { ClinicModel } from '../models/clinic.model';
import { ClinicMapper } from '../../mappers/clinic.mapper';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IFindClinicsRepository } from '../../../domain/repositories/find-clinics.repository';
import type { ClinicPersistence } from '../interfaces/clinic-persistence.interface';

@Injectable()
export class FindClinicsDynamooseAdapter implements IFindClinicsRepository {
  private readonly model = ClinicModel;

  async findAll(): Promise<ClinicEntity[]> {
    const items = await this.model
      .scan()
      .where('sk')
      .eq('CLINIC')
      .exec();

    return items.map((item) => ClinicMapper.toEntity(item as unknown as ClinicPersistence)
    );
  }
}