import { Injectable } from '@nestjs/common';
import { GetUserClinicIdUseCase } from '../../../users/application/use-cases/get-user-clinic-id.use-case';
import type { UserClinicReaderPort } from '../../application/ports/user-clinic-reader.port';

@Injectable()
export class UserClinicReaderAdapter implements UserClinicReaderPort {
  constructor(private readonly getUserClinicIdUseCase: GetUserClinicIdUseCase) {}

  getClinicIdByUserId(userId: string): Promise<string | null> {
    return this.getUserClinicIdUseCase.execute(userId);
  }
}
