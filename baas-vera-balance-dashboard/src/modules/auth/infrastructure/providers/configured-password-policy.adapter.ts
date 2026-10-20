import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PasswordPolicyProvider } from '../../domain/providers/password-policy.provider';
import { PasswordPolicyUnavailableError, PasswordTooShortError } from '../../domain/errors/auth.error';

@Injectable()
export class ConfiguredPasswordPolicyAdapter implements PasswordPolicyProvider {
  constructor(private readonly config: ConfigService) {}

  validate(password: string): void {
    // No implicit business default: the required policy must be supplied by
    // the project owner before password-changing operations can succeed.
    const minimum = Number(this.config.get('AUTH_PASSWORD_MIN_LENGTH'));
    if (!Number.isSafeInteger(minimum) || minimum < 1) {
      throw new PasswordPolicyUnavailableError();
    }
    if ([...password].length < minimum) throw new PasswordTooShortError();
  }
}
