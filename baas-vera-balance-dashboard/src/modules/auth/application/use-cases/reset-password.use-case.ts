import { Inject, Injectable } from '@nestjs/common';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { UserPasswordWriterPort } from '../ports/user-password-writer.port';
import { VerifySessionUseCase } from './verify-session.use-case';
import { ValidatePasswordDomainService } from '../../domain/services/validate-password.domain-service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly verifySession: VerifySessionUseCase,
    private readonly validatePassword: ValidatePasswordDomainService,
    @Inject('PasswordHasherPort') private readonly passwords: PasswordHasherPort,
    @Inject('UserPasswordWriterPort') private readonly writer: UserPasswordWriterPort
  ) {}

  async execute(token: string, password: string, confirmation: string): Promise<void> {
    const user = await this.verifySession.execute(token);
    this.validatePassword.execute(password, confirmation);
    const hash = await this.passwords.hash(password);
    await this.writer.update(user, hash);
  }
}
