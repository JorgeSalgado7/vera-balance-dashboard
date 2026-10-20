import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserByEmailRepository } from '../../domain/repositories/find-user-by-email.repository';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject('IFindUserByEmailRepository') private readonly repository: IFindUserByEmailRepository
  ) {}

  execute(email: string) { return this.repository.findByEmail(email.trim().toLowerCase()); }
}
