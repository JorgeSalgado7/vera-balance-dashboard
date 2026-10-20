import { Injectable } from '@nestjs/common';
import { MissingUserProfessionalLicenseError } from '../errors/user.error';

@Injectable()
export class ValidateUserProfessionalLicenseDomainService {
  execute(license: string): void {
    if (typeof license !== 'string' || !license.trim()) throw new MissingUserProfessionalLicenseError();
  }
}
