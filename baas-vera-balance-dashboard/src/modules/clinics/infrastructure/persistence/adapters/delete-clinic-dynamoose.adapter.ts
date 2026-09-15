import { Injectable } from '@nestjs/common';
import { ClinicModel } from '../models/clinic.model';
import type { IDeleteClinicRepository } from '../../../domain/repositories/delete-clinic.repository';

@Injectable()
export class DeleteClinicDynamooseAdapter implements IDeleteClinicRepository {
  private readonly model = ClinicModel;

  async delete(clinicId: string): Promise<void> {
    await this.model.delete({ pk: clinicId,  sk: 'CLINIC' });
  }
}