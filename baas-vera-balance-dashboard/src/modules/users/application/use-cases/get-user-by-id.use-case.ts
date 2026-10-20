import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import type { AuthenticatedUserContext } from '../dtos/authenticated-user-context.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    private readonly authorize: AuthorizeUserAccessDomainService,
    @Inject('IFindUserByIdRepository') private readonly repository: IFindUserByIdRepository
  ) {}

  async execute(actor: AuthenticatedUserContext, id: string): Promise<UserResponseDto> {
    this.authorize.execute(actor);
    const user = await this.repository.findById(id);
    this.authorize.target(actor, id, user);
    return UserResponseDto.fromEntity(user);
  }
}
