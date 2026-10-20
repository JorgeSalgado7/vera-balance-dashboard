import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDomainService } from '../../domain/services/create-user.domain-service';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import type { ICreateUserRepository } from '../../domain/repositories/create-user.repository';
import type { IFindUserByEmailRepository } from '../../domain/repositories/find-user-by-email.repository';
import type { UserPasswordHasherPort } from '../ports/user-password-hasher.port';
import type { AuthenticatedUserContext } from '../dtos/authenticated-user-context.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserAccessDeniedError, UserEmailAlreadyExistsError } from '../../domain/errors/user.error';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly authorize: AuthorizeUserAccessDomainService,
    private readonly createUser: CreateUserDomainService,
    @Inject('IFindUserByEmailRepository') private readonly emails: IFindUserByEmailRepository,
    @Inject('ICreateUserRepository') private readonly repository: ICreateUserRepository,
    @Inject('UserPasswordHasherPort') private readonly passwords: UserPasswordHasherPort
  ) {}

  async execute(actor: AuthenticatedUserContext, dto: CreateUserDto): Promise<UserResponseDto> {
    this.authorize.execute(actor, true);
    if (dto.clinic_id !== actor.clinicId) throw new UserAccessDeniedError();
    const profile = this.createUser.execute({
      id: randomUUID(), name: dto.name, email: dto.email, professionalLicense: dto.professional_license,
      clinicId: actor.clinicId, role: dto.role, password: dto.password,
      confirmation: dto.password_confirmation, now: new Date().toISOString()
    });
    if (await this.emails.findByEmail(profile.email)) throw new UserEmailAlreadyExistsError();
    const user = Object.assign(new UserEntity(), profile, { passwordHash: await this.passwords.hash(dto.password) });
    await this.repository.create(user, actor);
    return UserResponseDto.fromEntity(user);
  }
}
