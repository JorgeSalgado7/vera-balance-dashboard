import { Test } from '@nestjs/testing';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { ChangeUserStatusUseCase } from '../../application/use-cases/change-user-status.use-case';
import { CreateUserDomainService } from '../../domain/services/create-user.domain-service';
import { UpdateUserDomainService } from '../../domain/services/update-user.domain-service';
import { ChangeUserStatusDomainService } from '../../domain/services/change-user-status.domain-service';
import { AuthorizeUserAccessDomainService } from '../../domain/services/authorize-user-access.domain-service';
import { ProtectActiveAdministratorDomainService } from '../../domain/services/protect-active-administrator.domain-service';
import { ValidateUserNameDomainService } from '../../domain/services/validate-user-name.domain-service';
import { ValidateUserEmailDomainService } from '../../domain/services/validate-user-email.domain-service';
import { ValidateUserProfessionalLicenseDomainService } from '../../domain/services/validate-user-professional-license.domain-service';
import { ValidateUserRoleDomainService } from '../../domain/services/validate-user-role.domain-service';
import { ValidateUserPasswordDomainService } from '../../domain/services/validate-user-password.domain-service';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';

export const clinicId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const actor: AuthenticatedUserContext = {
  id: '11111111-1111-4111-8111-111111111111', clinicId, role: 'clinic', status: 'active'
};
export const targetId = '22222222-2222-4222-8222-222222222222';

export function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return Object.assign(new UserEntity(), {
    id: targetId, name: 'User', email: 'user@example.com', passwordHash: 'stored-password-hash',
    professionalLicense: '12345678', clinicId, role: 'therapist', status: 'active',
    createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z'
  }, overrides);
}

export const createInput = {
  name: 'New user', email: 'new@example.com', professional_license: '12345678',
  password: 'a valid long password', password_confirmation: 'a valid long password',
  clinic_id: clinicId, role: 'therapist' as const
};

export async function setupUseCases() {
  const users = { findById: jest.fn().mockResolvedValue(makeUser()) };
  const emails = { findByEmail: jest.fn().mockResolvedValue(null) };
  const list = { findByClinicId: jest.fn().mockResolvedValue([makeUser({ ...actor }), makeUser()]) };
  const create = { create: jest.fn() };
  const update = { update: jest.fn() };
  const change = { change: jest.fn() };
  const remove = { delete: jest.fn() };
  const passwords = { hash: jest.fn().mockResolvedValue('secure-new-hash') };
  const module = await Test.createTestingModule({
    providers: [
      CreateUserUseCase, GetUsersUseCase, GetUserByIdUseCase, UpdateUserUseCase,
      DeleteUserUseCase, ChangeUserStatusUseCase, CreateUserDomainService, UpdateUserDomainService,
      ChangeUserStatusDomainService, AuthorizeUserAccessDomainService, ProtectActiveAdministratorDomainService,
      ValidateUserNameDomainService, ValidateUserEmailDomainService, ValidateUserProfessionalLicenseDomainService,
      ValidateUserRoleDomainService, ValidateUserPasswordDomainService,
      { provide: 'IFindUserByIdRepository', useValue: users },
      { provide: 'IFindUserByEmailRepository', useValue: emails },
      { provide: 'IFindUsersRepository', useValue: list },
      { provide: 'ICreateUserRepository', useValue: create },
      { provide: 'IUpdateUserRepository', useValue: update },
      { provide: 'IChangeUserStatusRepository', useValue: change },
      { provide: 'IDeleteUserRepository', useValue: remove },
      { provide: 'UserPasswordHasherPort', useValue: passwords }
    ]
  }).compile();
  return { module, users, emails, list, create, update, change, remove, passwords };
}
