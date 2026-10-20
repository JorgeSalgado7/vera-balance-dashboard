import { Inject, Injectable } from '@nestjs/common';
import type { SessionPort } from '../ports/session.port';
import type { AuthUser, AuthUserReaderPort } from '../ports/auth-user-reader.port';
import { ValidateAuthAccountService } from '../services/validate-auth-account.service';
import { InvalidSessionError } from '../../domain/errors/auth.error';

@Injectable()
export class VerifySessionUseCase {
  constructor(
    @Inject('SessionPort') private readonly sessions: SessionPort,
    @Inject('AuthUserReaderPort') private readonly users: AuthUserReaderPort,
    private readonly validateAccount: ValidateAuthAccountService
  ) {}

  async execute(token: string): Promise<AuthUser> {
    if (!token) throw new InvalidSessionError();
    const id = await this.sessions.verify(token);
    const user = await this.users.findById(id);
    if (!user) throw new InvalidSessionError();
    await this.validateAccount.execute(user);
    return user;
  }
}
