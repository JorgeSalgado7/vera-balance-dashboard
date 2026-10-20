import { Inject, Injectable } from '@nestjs/common';
import type { AuthUser } from '../ports/auth-user-reader.port';
import type { AuthClinicReaderPort } from '../ports/auth-clinic-reader.port';
import { InactiveAccountError } from '../../domain/errors/auth.error';

@Injectable()
export class ValidateAuthAccountService {
  constructor(
    @Inject('AuthClinicReaderPort')
    private readonly clinics: AuthClinicReaderPort
  ) {}

  async execute(user: AuthUser): Promise<void> {
    if (user.status !== 'active' || !await this.clinics.isActive(user.clinicId)) {
      throw new InactiveAccountError();
    }
  }
}
