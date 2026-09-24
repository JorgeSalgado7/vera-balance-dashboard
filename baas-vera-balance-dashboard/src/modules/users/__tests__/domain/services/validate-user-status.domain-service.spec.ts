import { ValidateUserStatusDomainService } from '../../../domain/services/validate-user-status.domain-service';
import { InvalidUserStatusError } from '../../../domain/errors/user.error';
import type { UserStatus } from '../../../domain/entities/user.entity';

describe('ValidateUserStatusDomainService', () => {
  const service = new ValidateUserStatusDomainService();

  it.each(['active', 'inactive'] as const)('should accept %s', status => {
    expect(() => service.execute(status)).not.toThrow();
  });

  it.each(['Active', 'disabled', '', null, undefined, 0, {}])('should reject %j', status => {
    expect(() => service.execute(status as UserStatus)).toThrow(InvalidUserStatusError);
  });
});
