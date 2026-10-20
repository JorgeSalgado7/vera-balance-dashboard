import { Inject, Injectable } from '@nestjs/common';
import type { IFindUsersRepository } from '../../domain/repositories/find-users.repository';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import type { AuthenticatedUserContext } from '../dtos/authenticated-user-context.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    private readonly authorize: AuthorizeUserAccessDomainService,
    @Inject('IFindUsersRepository') private readonly repository: IFindUsersRepository
  ) {}

  async execute(actor: AuthenticatedUserContext): Promise<UserResponseDto[]> {
    this.authorize.execute(actor, true);
    return (await this.repository.findByClinicId(actor.clinicId)).map(UserResponseDto.fromEntity);
  }
}
