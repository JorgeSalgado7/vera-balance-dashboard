import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import type { IDeleteUserRepository } from '../../domain/repositories/delete-user.repository';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import { ClinicUserCannotBeDeletedError } from '../../domain/errors/user.error';
import type { AuthenticatedUserContext } from '../dtos/authenticated-user-context.dto';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly authorize: AuthorizeUserAccessDomainService,
    @Inject('IFindUserByIdRepository') private readonly users: IFindUserByIdRepository,
    @Inject('IDeleteUserRepository') private readonly repository: IDeleteUserRepository
  ) {}

  async execute(actor: AuthenticatedUserContext, id: string): Promise<void> {
    this.authorize.execute(actor, true);
    const current = await this.users.findById(id);
    this.authorize.target(actor, id, current);
    if (current.role === 'clinic') throw new ClinicUserCannotBeDeletedError();
    await this.repository.delete(current, actor);
  }
}
