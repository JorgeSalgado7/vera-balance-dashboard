import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import type { IDeleteUserRepository } from '../../../domain/repositories/delete-user.repository';

@Injectable()
export class DeleteUserDynamooseAdapter implements IDeleteUserRepository {
  private readonly model = UserModel;

  async delete(userId: string): Promise<void> {
    await this.model.delete({ pk: userId, sk: 'USER' });
  }
}
