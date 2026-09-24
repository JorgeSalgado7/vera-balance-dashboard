import { Injectable } from '@nestjs/common';
import { GetClinicByIdUseCase } from '../../../clinics/application/use-cases/get-clinic-by-id.use-case';
import type { ClinicReaderPort } from '../../application/ports/clinic-reader.port';

@Injectable()
export class ClinicReaderAdapter implements ClinicReaderPort {
  constructor(private readonly getClinic: GetClinicByIdUseCase) {}
  async requireExisting(id: string): Promise<void> {
    await this.getClinic.execute(id);
  }
}
