import { Injectable } from '@nestjs/common';
import { MissingUserNameError } from '../errors/user.error';

@Injectable()
export class ValidateUserNameDomainService {
  execute(name: string): void {
    if (typeof name !== 'string' || !name.trim()) throw new MissingUserNameError();
  }
}
