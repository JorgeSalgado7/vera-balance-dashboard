import { Inject, Injectable } from '@nestjs/common';
import type { SessionPort } from '../ports/session.port';
import { VerifySessionUseCase } from './verify-session.use-case';
import { InactiveAccountError, InvalidSessionError } from '../../domain/errors/auth.error';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly verifySession: VerifySessionUseCase,
    @Inject('SessionPort') private readonly sessions: SessionPort
  ) {}

  async execute(token: string): Promise<string> {
    try {
      const user = await this.verifySession.execute(token);
      return this.sessions.issue(user.id);
    } catch (error) {
      if (error instanceof InactiveAccountError) throw new InvalidSessionError();
      throw error;
    }
  }
}
