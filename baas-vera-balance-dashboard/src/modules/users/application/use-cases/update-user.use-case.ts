import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import type { IFindUserByEmailRepository } from '../../domain/repositories/find-user-by-email.repository';
import type { IFindUsersRepository } from '../../domain/repositories/find-users.repository';
import type { IUpdateUserRepository } from '../../domain/repositories/update-user.repository';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import { UpdateUserDomainService } from '../../domain/services/update-user.domain-service';
import { ProtectActiveAdministratorDomainService } from '../../domain/services/protect-active-administrator.domain-service';
import { UserAccessDeniedError, UserEmailAlreadyExistsError } from '../../domain/errors/user.error';
import type { AuthenticatedUserContext } from '../dtos/authenticated-user-context.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly authorize: AuthorizeUserAccessDomainService,
    private readonly updateUser: UpdateUserDomainService,
    private readonly protectAdministrator: ProtectActiveAdministratorDomainService,
    @Inject('IFindUserByIdRepository') private readonly users: IFindUserByIdRepository,
    @Inject('IFindUserByEmailRepository') private readonly emails: IFindUserByEmailRepository,
    @Inject('IFindUsersRepository') private readonly list: IFindUsersRepository,
    @Inject('IUpdateUserRepository') private readonly repository: IUpdateUserRepository
  ) {}

  async execute(actor: AuthenticatedUserContext, id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.authorize.execute(actor);
    if (actor.role === 'therapist' && dto.role !== undefined) throw new UserAccessDeniedError();
    const current = await this.users.findById(id);
    this.authorize.target(actor, id, current);
    const next = this.updateUser.execute(current, {
      name: dto.name, email: dto.email, professionalLicense: dto.professional_license, role: dto.role
    });
    if (next.email !== current.email) {
      const existing = await this.emails.findByEmail(next.email);
      if (existing && existing.id !== current.id) throw new UserEmailAlreadyExistsError();
    }
    if (next.name === current.name && next.email === current.email
      && next.professionalLicense === current.professionalLicense && next.role === current.role) {
      return UserResponseDto.fromEntity(current);
    }
    const removesAdministrator = current.status === 'active' && current.role === 'clinic' && next.role !== 'clinic';
    const witness = this.protectAdministrator.execute(current, next,
      removesAdministrator ? await this.list.findByClinicId(actor.clinicId) : []);
    await this.repository.update(current, next, actor, witness);
    return UserResponseDto.fromEntity(next);
  }
}
