import { Test, TestingModule } from '@nestjs/testing';
import { ValidatePasswordRecoveryDomainService } from '../../../domain/services/validate-password-recovery.domain-service';
import { InvalidRecoveryCodeError } from '../../../domain/errors/auth.error';
import type { PasswordRecoveryEntity } from '../../../domain/entities/password-recovery.entity';

describe('ValidatePasswordRecoveryDomainService', () => {
  let module: TestingModule;
  let service: ValidatePasswordRecoveryDomainService;
  const recovery: PasswordRecoveryEntity = {
    userId: 'user', codeHash: 'protected', attempts: 0,
    createdAt: '2026-10-19T12:00:00Z', expiresAt: '2026-10-19T12:05:00Z', ttl: 1
  };
  const now = Date.parse('2026-10-19T12:04:59Z');

  beforeEach(async () => {
    module = await Test.createTestingModule({ providers: [ValidatePasswordRecoveryDomainService] }).compile();
    service = module.get(ValidatePasswordRecoveryDomainService);
  });
  afterEach(async () => { await module.close(); });

  it('accepts a logically valid code independently of eventual TTL deletion', () => {
    expect(() => service.execute(recovery, now)).not.toThrow();
  });

  it.each([
    null,
    { ...recovery, attempts: 5 },
    { ...recovery, attempts: 6 },
    { ...recovery, attempts: -1 },
    { ...recovery, attempts: 0.5 },
    { ...recovery, expiresAt: 'invalid-date' },
    { ...recovery, expiresAt: '2026-10-19T12:04:59Z' },
    { ...recovery, expiresAt: '2026-10-19T12:04:58Z' }
  ])('rejects missing, expired or exhausted recovery data: %j', value => {
    expect(() => service.execute(value, now)).toThrow(InvalidRecoveryCodeError);
  });
});
