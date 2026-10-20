import { Injectable } from '@nestjs/common';
import { InvalidUserEmailError } from '../errors/user.error';

@Injectable()
export class ValidateUserEmailDomainService {
  execute(email: string): string {
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new InvalidUserEmailError();
    }
    return email.trim().toLowerCase();
  }
}
