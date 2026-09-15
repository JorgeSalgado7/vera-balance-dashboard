import { Injectable } from '@nestjs/common';
import type { ClinicStatus } from '../entities/clinic.entity';
import { InvalidClinicStatusError } from '../errors/clinic.error';

@Injectable()
export class ValidateClinicStatusDomainService {

  execute(status: ClinicStatus): void {
    const statuses: ClinicStatus[] = [
      'active',
      'inactive'
    ];

    if (!statuses.includes(status)) {
      throw new InvalidClinicStatusError();
    }
  }
  
}