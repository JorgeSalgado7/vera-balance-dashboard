import { Injectable } from '@nestjs/common';
import { IsClinicActiveUseCase } from '../../../clinics/application/use-cases/is-clinic-active.use-case';
import type { AuthClinicReaderPort } from '../../application/ports/auth-clinic-reader.port';

@Injectable()
export class AuthClinicReaderAdapter implements AuthClinicReaderPort {
  constructor(private readonly isClinicActive: IsClinicActiveUseCase) {}

  isActive(id: string) { return this.isClinicActive.execute(id); }
}
