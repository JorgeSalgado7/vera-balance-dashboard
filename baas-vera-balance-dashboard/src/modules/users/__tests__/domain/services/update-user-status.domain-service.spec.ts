import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserStatusDomainService } from '../../../domain/services/update-user-status.domain-service';
import { ValidateUserStatusDomainService } from '../../../domain/services/validate-user-status.domain-service';
import { ValidateUserRoleDomainService } from '../../../domain/services/validate-user-role.domain-service';
import { MissingUserUpdatedAtError } from '../../../domain/errors/user.error';
import type { UserEntity } from '../../../domain/entities/user.entity';

describe('UpdateUserStatusDomainService', () => {
  let module: TestingModule;
  let service: UpdateUserStatusDomainService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UpdateUserStatusDomainService, ValidateUserStatusDomainService, ValidateUserRoleDomainService]
    }).compile();
    service = module.get(UpdateUserStatusDomainService);
  });

  afterEach(async () => { await module.close(); });

  it('should reject an omitted modification date before changing the entity', () => {
    const existing = { id: 'user-id', status: 'active' } as UserEntity;
    expect(() => service.execute(existing, { status: 'inactive', updatedAt: '' })).toThrow(MissingUserUpdatedAtError);
    expect(existing).toEqual({ id: 'user-id', status: 'active' });
  });
});
