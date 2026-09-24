
import { Inject, Injectable } from '@nestjs/common';
import type { IDeleteUserRepository } from '../../domain/repositories/delete-user.repository';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import { UserNotFoundError } from '../../domain/errors/user.error';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IFindUserByIdRepository')
    private readonly findUserByIdRepository: IFindUserByIdRepository,

    @Inject('IDeleteUserRepository')
    private readonly deleteUserRepository: IDeleteUserRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.findUserByIdRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.deleteUserRepository.delete(userId);
  }
}
