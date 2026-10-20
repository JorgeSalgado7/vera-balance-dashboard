import { Injectable } from '@nestjs/common';
import { InvalidUserPasswordError, UserPasswordConfirmationMismatchError } from '../errors/user.error';

@Injectable()
export class ValidateUserPasswordDomainService {
  execute(password: string, confirmation: string): void {
    if (typeof password !== 'string' || !password.trim() || [...password].length < 12) {
      throw new InvalidUserPasswordError();
    }
    if (typeof confirmation !== 'string' || password !== confirmation) {
      throw new UserPasswordConfirmationMismatchError();
    }
  }
}
