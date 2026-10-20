import { Inject, Injectable } from '@nestjs/common';
import {
  MissingPasswordError,
  PasswordConfirmationMismatchError
} from '../errors/auth.error';
import type { PasswordPolicyProvider } from '../providers/password-policy.provider';

@Injectable()
export class ValidatePasswordDomainService {
  constructor(
    @Inject('PasswordPolicyProvider') private readonly policy: PasswordPolicyProvider
  ) {}

  execute(password: string, confirmation: string): void {
    if (typeof password !== 'string' || !password.trim()
      || typeof confirmation !== 'string' || !confirmation.trim()) {
      throw new MissingPasswordError();
    }

    if (password !== confirmation) {
      throw new PasswordConfirmationMismatchError();
    }

    this.policy.validate(password);
  }
}
