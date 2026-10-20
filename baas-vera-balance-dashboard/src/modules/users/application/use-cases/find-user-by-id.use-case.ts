import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('IFindUserByIdRepository') private readonly repository: IFindUserByIdRepository
  ) {}

  execute(id: string) { return this.repository.findById(id); }
}
