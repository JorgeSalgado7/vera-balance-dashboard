import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case';
import { ForgotPasswordResetUseCase } from '../../../application/use-cases/forgot-password-reset.use-case';
import { VerifySessionUseCase } from '../../../application/use-cases/verify-session.use-case';
import { ValidateAuthAccountService } from '../../../application/services/validate-auth-account.service';
import { ValidatePasswordDomainService } from '../../../domain/services/validate-password.domain-service';
import { ValidatePasswordRecoveryDomainService } from '../../../domain/services/validate-password-recovery.domain-service';
import { ConfiguredPasswordPolicyAdapter } from '../../../infrastructure/providers/configured-password-policy.adapter';
import {
  InvalidSessionError, InvalidRecoveryCodeError, InactiveAccountError, PasswordTooShortError,
  PasswordConfirmationMismatchError, PasswordPolicyUnavailableError, MissingPasswordError
} from '../../../domain/errors/auth.error';

describe('Password change use cases', () => {
  let module: TestingModule;
  const user = { id: 'user', email: 'user@example.com', clinicId: 'clinic', status: 'active', passwordHash: 'old-hash' };
  const recovery = {
    userId: 'user', codeHash: 'protected-code', attempts: 0,
    createdAt: '2026-10-19T12:00:00Z', expiresAt: '2026-10-19T12:05:00Z', ttl: 1
  };
  const users = { findByEmail: jest.fn(), findById: jest.fn() };
  const clinics = { isActive: jest.fn() };
  const sessions = { verify: jest.fn(), issue: jest.fn() };
  const passwords = { hash: jest.fn() };
  const codes = { matches: jest.fn() };
  const recoveries = { findByUserId: jest.fn() };
  const attempts = { register: jest.fn() };
  const consumer = { consume: jest.fn() };
  const writer = { update: jest.fn() };
  const config = new ConfigService({ AUTH_PASSWORD_MIN_LENGTH: 12 });
  const password = 'test-password-long-enough';

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-19T12:01:00Z'));
    jest.resetAllMocks();
    config.set('AUTH_PASSWORD_MIN_LENGTH', 12);
    users.findByEmail.mockResolvedValue(user);
    users.findById.mockResolvedValue(user);
    clinics.isActive.mockResolvedValue(true);
    sessions.verify.mockResolvedValue('user');
    passwords.hash.mockResolvedValue('new-hash');
    codes.matches.mockReturnValue(true);
    recoveries.findByUserId.mockResolvedValue(recovery);
    attempts.register.mockResolvedValue(true);
    consumer.consume.mockResolvedValue(true);
    module = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase, ForgotPasswordResetUseCase, VerifySessionUseCase,
        ValidateAuthAccountService, ValidatePasswordDomainService, ValidatePasswordRecoveryDomainService,
        { provide: 'PasswordPolicyProvider', useClass: ConfiguredPasswordPolicyAdapter },
        { provide: ConfigService, useValue: config },
        { provide: 'AuthUserReaderPort', useValue: users },
        { provide: 'AuthClinicReaderPort', useValue: clinics },
        { provide: 'SessionPort', useValue: sessions },
        { provide: 'PasswordHasherPort', useValue: passwords },
        { provide: 'RecoveryCodePort', useValue: codes },
        { provide: 'IFindPasswordRecoveryRepository', useValue: recoveries },
        { provide: 'IRegisterRecoveryAttemptRepository', useValue: attempts },
        { provide: 'IConsumePasswordRecoveryRepository', useValue: consumer },
        { provide: 'UserPasswordWriterPort', useValue: writer }
      ]
    }).compile();
  });
  afterEach(async () => {
    expect(sessions.issue).not.toHaveBeenCalled();
    jest.useRealTimers();
    await module.close();
  });

  const reset = () => module.get(ForgotPasswordResetUseCase).execute(user.email, '123456', password, password);

  it('changes only the authenticated account using a hash, never a client identity', async () => {
    await module.get(ResetPasswordUseCase).execute('session', password, password);
    expect(writer.update).toHaveBeenCalledWith(user, 'new-hash');
    expect(passwords.hash).toHaveBeenCalledWith(password);
    expect(consumer.consume).not.toHaveBeenCalled();
  });

  it('rejects an absent authenticated session without hashing or writes', async () => {
    await expect(module.get(ResetPasswordUseCase).execute('', password, password)).rejects.toThrow(InvalidSessionError);
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(writer.update).not.toHaveBeenCalled();
  });

  it.each([
    ['', '', MissingPasswordError],
    ['short', 'short', PasswordTooShortError],
    [password, 'different-confirmation', PasswordConfirmationMismatchError]
  ])('rejects invalid passwords before hashes or persistence', async (value, confirmation, expected) => {
    await expect(module.get(ResetPasswordUseCase).execute('session', value as string, confirmation as string))
      .rejects.toThrow(expected as new () => Error);
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('fails closed when no password policy has been defined', async () => {
    config.set('AUTH_PASSWORD_MIN_LENGTH', undefined as unknown as number);
    await expect(reset()).rejects.toThrow(PasswordPolicyUnavailableError);
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(consumer.consume).not.toHaveBeenCalled();
  });

  it('consumes a valid recovery and changes its user password through one atomic repository operation', async () => {
    await expect(reset()).resolves.toBeUndefined();
    expect(consumer.consume).toHaveBeenCalledWith(recovery, user, 'new-hash');
    expect(writer.update).not.toHaveBeenCalled();
    expect(attempts.register).not.toHaveBeenCalled();
  });

  it.each(['missing-user', 'missing-recovery', 'expired', 'five-attempts', 'incorrect-code'])(
    'rejects %s without updating the password', async failure => {
      if (failure === 'missing-user') users.findByEmail.mockResolvedValue(null);
      if (failure === 'missing-recovery') recoveries.findByUserId.mockResolvedValue(null);
      if (failure === 'expired') recoveries.findByUserId.mockResolvedValue({ ...recovery, expiresAt: '2026-10-19T12:00:59Z' });
      if (failure === 'five-attempts') recoveries.findByUserId.mockResolvedValue({ ...recovery, attempts: 5 });
      if (failure === 'incorrect-code') codes.matches.mockReturnValue(false);
      await expect(reset()).rejects.toThrow(InvalidRecoveryCodeError);
      expect(passwords.hash).not.toHaveBeenCalled();
      expect(consumer.consume).not.toHaveBeenCalled();
      expect(attempts.register).toHaveBeenCalledTimes(failure === 'incorrect-code' ? 1 : 0);
    }
  );

  it('rechecks the recovery after a concurrent incorrect attempt instead of losing the increment', async () => {
    codes.matches.mockReturnValue(false);
    attempts.register.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    recoveries.findByUserId.mockResolvedValueOnce(recovery).mockResolvedValueOnce({ ...recovery, attempts: 1 });
    await expect(reset()).rejects.toThrow(InvalidRecoveryCodeError);
    expect(attempts.register).toHaveBeenCalledTimes(2);
    expect(attempts.register).toHaveBeenLastCalledWith({ ...recovery, attempts: 1 });
    expect(consumer.consume).not.toHaveBeenCalled();
  });

  it.each(['inactive-user', 'inactive-clinic'])('rejects %s before consumption', async failure => {
    if (failure === 'inactive-user') users.findByEmail.mockResolvedValue({ ...user, status: 'inactive' });
    else clinics.isActive.mockResolvedValue(false);
    await expect(reset()).rejects.toThrow(InvalidRecoveryCodeError);
    expect(consumer.consume).not.toHaveBeenCalled();
  });

  it('rejects a concurrent consumption, issuance replacement or fifth attempt conflict', async () => {
    consumer.consume.mockResolvedValue(false);
    await expect(reset()).rejects.toThrow(InvalidRecoveryCodeError);
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('propagates atomic persistence failure without a second separate password write', async () => {
    consumer.consume.mockRejectedValue(new Error('Transaction unavailable'));
    await expect(reset()).rejects.toThrow('Transaction unavailable');
    expect(writer.update).not.toHaveBeenCalled();
  });
});
