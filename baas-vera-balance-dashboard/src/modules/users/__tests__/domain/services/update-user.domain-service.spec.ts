import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDomainService } from '../../../domain/services/update-user.domain-service';
import { ValidateUserStatusDomainService } from '../../../domain/services/validate-user-status.domain-service';
import { ValidateUserRoleDomainService } from '../../../domain/services/validate-user-role.domain-service';
import { MissingUserUpdatedAtError } from '../../../domain/errors/user.error';
import type { UserEntity } from '../../../domain/entities/user.entity';

describe('UpdateUserDomainService', () => {
  let module: TestingModule;
  let service: UpdateUserDomainService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UpdateUserDomainService, ValidateUserStatusDomainService, ValidateUserRoleDomainService]
    }).compile();
    service = module.get(UpdateUserDomainService);
  });

  afterEach(async () => { await module.close(); });

  it('should reject an omitted modification date before changing the entity', () => {
    const existing = { id: 'user-id', status: 'active' } as UserEntity;
    expect(() => service.execute(existing, { status: 'inactive', updatedAt: '' })).toThrow(MissingUserUpdatedAtError);
    expect(existing).toEqual({ id: 'user-id', status: 'active' });
  });
});
