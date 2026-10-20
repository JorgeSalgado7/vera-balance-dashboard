import { Injectable } from '@nestjs/common';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case';
import type { AuthUserReaderPort } from '../../application/ports/auth-user-reader.port';

@Injectable()
export class AuthUserReaderAdapter implements AuthUserReaderPort {
  constructor(
    private readonly byId: FindUserByIdUseCase,
    private readonly byEmail: FindUserByEmailUseCase
  ) {}

  async findById(id: string) {
    try { return await this.byId.execute(id); }
    catch { throw new Error('Unable to read user credentials.'); }
  }

  async findByEmail(email: string) {
    try { return await this.byEmail.execute(email); }
    catch { throw new Error('Unable to read user credentials.'); }
  }
}
