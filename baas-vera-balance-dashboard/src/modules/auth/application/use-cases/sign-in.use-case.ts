import { Inject, Injectable } from '@nestjs/common';
import type { AuthUserReaderPort } from '../ports/auth-user-reader.port';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { SessionPort } from '../ports/session.port';
import { ValidateAuthAccountService } from '../services/validate-auth-account.service';
import { InvalidCredentialsError, InactiveAccountError } from '../../domain/errors/auth.error';

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject('AuthUserReaderPort') private readonly users: AuthUserReaderPort,
    @Inject('PasswordHasherPort') private readonly passwords: PasswordHasherPort,
    @Inject('SessionPort') private readonly sessions: SessionPort,
    private readonly validateAccount: ValidateAuthAccountService
  ) {}

  async execute(email: string, password: string): Promise<string> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user || !await this.passwords.verify(password, user.passwordHash)) {
      throw new InvalidCredentialsError();
    }
    try {
      await this.validateAccount.execute(user);
    } catch (error) {
      if (error instanceof InactiveAccountError) throw new InvalidCredentialsError();
      throw error;
    }
    return this.sessions.issue(user.id);
  }
}
