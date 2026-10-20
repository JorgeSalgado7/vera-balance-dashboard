import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import type { IFindUsersRepository } from '../../domain/repositories/find-users.repository';
import type { IChangeUserStatusRepository } from '../../domain/repositories/change-user-status.repository';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import { ChangeUserStatusDomainService } from '../../domain/services/change-user-status.domain-service';
import { ProtectActiveAdministratorDomainService } from '../../domain/services/protect-active-administrator.domain-service';
import type { AuthenticatedUserContext } from '../dtos/authenticated-user-context.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class ChangeUserStatusUseCase {
  constructor(
    private readonly authorize: AuthorizeUserAccessDomainService,
    private readonly changeStatus: ChangeUserStatusDomainService,
    private readonly protectAdministrator: ProtectActiveAdministratorDomainService,
    @Inject('IFindUserByIdRepository') private readonly users: IFindUserByIdRepository,
    @Inject('IFindUsersRepository') private readonly list: IFindUsersRepository,
    @Inject('IChangeUserStatusRepository') private readonly repository: IChangeUserStatusRepository
  ) {}

  async execute(actor: AuthenticatedUserContext, id: string, status: string): Promise<UserResponseDto> {
    this.authorize.execute(actor, true);
    const current = await this.users.findById(id);
    this.authorize.target(actor, id, current);
    const next = this.changeStatus.execute(current, status);
    if (next.status === current.status) return UserResponseDto.fromEntity(current);
    const removesAdministrator = current.status === 'active' && current.role === 'clinic' && next.status === 'inactive';
    const witness = this.protectAdministrator.execute(current, next,
      removesAdministrator ? await this.list.findByClinicId(actor.clinicId) : []);
    await this.repository.change(current, next, actor, witness);
    return UserResponseDto.fromEntity(next);
  }
}
