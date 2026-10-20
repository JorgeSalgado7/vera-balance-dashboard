import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case';
import { ValidateAuthAccountService } from '../../../application/services/validate-auth-account.service';

describe('ForgotPasswordUseCase', () => {
  let module: TestingModule;
  const users = { findByEmail: jest.fn() };
  const clinics = { isActive: jest.fn() };
  const codes = { generate: jest.fn(), protect: jest.fn() };
  const email = { send: jest.fn() };
  const recoveries = { save: jest.fn() };
  const user = { id: 'user', email: 'user@example.com', clinicId: 'clinic', status: 'active' };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-19T12:00:00.000Z'));
    jest.resetAllMocks();
    users.findByEmail.mockResolvedValue(user);
    clinics.isActive.mockResolvedValue(true);
    codes.generate.mockReturnValue('000123');
    codes.protect.mockReturnValue('protected-code');
    module = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase, ValidateAuthAccountService,
        { provide: 'AuthUserReaderPort', useValue: users },
        { provide: 'AuthClinicReaderPort', useValue: clinics },
        { provide: 'RecoveryCodePort', useValue: codes },
        { provide: 'RecoveryEmailPort', useValue: email },
        { provide: 'ISavePasswordRecoveryRepository', useValue: recoveries }
      ]
    }).compile();
  });

  afterEach(async () => { jest.useRealTimers(); await module.close(); });

  it('stores only protected data with five-minute expiry, zero attempts, and TTL', async () => {
    await expect(module.get(ForgotPasswordUseCase).execute(' USER@example.com ')).resolves.toEqual({ accepted: true });
    expect(users.findByEmail).toHaveBeenCalledWith(user.email);
    expect(recoveries.save).toHaveBeenCalledWith({
      userId: 'user', codeHash: 'protected-code', attempts: 0,
      createdAt: '2026-10-19T12:00:00.000Z', expiresAt: '2026-10-19T12:05:00.000Z',
      ttl: Math.floor(Date.parse('2026-10-19T12:05:00.000Z') / 1000)
    });
    expect(email.send).toHaveBeenCalledWith(user.email, '000123');
    expect(JSON.stringify(recoveries.save.mock.calls)).not.toContain('000123');
  });

  it.each(['missing', 'inactive-user', 'inactive-clinic'])('returns the same response for %s without generating codes', async failure => {
    if (failure === 'missing') users.findByEmail.mockResolvedValue(null);
    if (failure === 'inactive-user') users.findByEmail.mockResolvedValue({ ...user, status: 'inactive' });
    if (failure === 'inactive-clinic') clinics.isActive.mockResolvedValue(false);
    await expect(module.get(ForgotPasswordUseCase).execute(user.email)).resolves.toEqual({ accepted: true });
    expect(codes.generate).not.toHaveBeenCalled();
    expect(recoveries.save).not.toHaveBeenCalled();
    expect(email.send).not.toHaveBeenCalled();
  });

  it('does not reveal account existence through a provider failure', async () => {
    email.send.mockRejectedValue(new Error('sensitive provider response'));
    await expect(module.get(ForgotPasswordUseCase).execute(user.email)).resolves.toEqual({ accepted: true });
  });

  it('returns the same accepted response on recovery storage failure without sending an unusable code', async () => {
    recoveries.save.mockRejectedValue(new Error('Storage unavailable'));
    await expect(module.get(ForgotPasswordUseCase).execute(user.email)).resolves.toEqual({ accepted: true });
    expect(email.send).not.toHaveBeenCalled();
  });

  it('replaces recovery information on each new accepted request', async () => {
    await module.get(ForgotPasswordUseCase).execute(user.email);
    codes.generate.mockReturnValue('654321');
    await module.get(ForgotPasswordUseCase).execute(user.email);
    expect(recoveries.save).toHaveBeenCalledTimes(2);
    expect(email.send).toHaveBeenLastCalledWith(user.email, '654321');
  });
});
