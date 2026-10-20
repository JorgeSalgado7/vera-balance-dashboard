import { Test, TestingModule } from '@nestjs/testing';
import { SignInUseCase } from '../../../application/use-cases/sign-in.use-case';
import { VerifySessionUseCase } from '../../../application/use-cases/verify-session.use-case';
import { RefreshSessionUseCase } from '../../../application/use-cases/refresh-session.use-case';
import { ValidateAuthAccountService } from '../../../application/services/validate-auth-account.service';
import { InvalidCredentialsError, InvalidSessionError, InactiveAccountError } from '../../../domain/errors/auth.error';

describe('Auth session use cases', () => {
  let module: TestingModule;
  const users = { findByEmail: jest.fn(), findById: jest.fn() };
  const passwords = { verify: jest.fn(), hash: jest.fn() };
  const sessions = { verify: jest.fn(), issue: jest.fn() };
  const clinics = { isActive: jest.fn() };
  const user = {
    id: 'user-id', email: 'user@example.com', passwordHash: 'stored-hash',
    clinicId: 'clinic-id', status: 'active', role: 'therapist'
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    users.findByEmail.mockResolvedValue({ ...user });
    users.findById.mockResolvedValue({ ...user });
    passwords.verify.mockResolvedValue(true);
    sessions.issue.mockResolvedValue('signed-session');
    sessions.verify.mockResolvedValue(user.id);
    clinics.isActive.mockResolvedValue(true);
    module = await Test.createTestingModule({
      providers: [
        SignInUseCase, VerifySessionUseCase, RefreshSessionUseCase, ValidateAuthAccountService,
        { provide: 'AuthUserReaderPort', useValue: users },
        { provide: 'PasswordHasherPort', useValue: passwords },
        { provide: 'SessionPort', useValue: sessions },
        { provide: 'AuthClinicReaderPort', useValue: clinics }
      ]
    }).compile();
  });

  afterEach(async () => {
    expect(passwords.hash).not.toHaveBeenCalled();
    await module.close();
  });

  it('normalizes email, verifies the stored hash, and issues only after account checks', async () => {
    await expect(module.get(SignInUseCase).execute(' User@Example.com ', 'password')).resolves.toBe('signed-session');
    expect(users.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(passwords.verify).toHaveBeenCalledWith('password', 'stored-hash');
    expect(clinics.isActive).toHaveBeenCalledWith('clinic-id');
    expect(sessions.issue).toHaveBeenCalledWith('user-id');
  });

  it.each(['missing', 'wrong-password', 'inactive-user', 'inactive-clinic'])(
    'uses a generic authentication error for %s and never issues a session', async failure => {
      if (failure === 'missing') users.findByEmail.mockResolvedValue(null);
      if (failure === 'wrong-password') passwords.verify.mockResolvedValue(false);
      if (failure === 'inactive-user') users.findByEmail.mockResolvedValue({ ...user, status: 'inactive' });
      if (failure === 'inactive-clinic') clinics.isActive.mockResolvedValue(false);
      await expect(module.get(SignInUseCase).execute(user.email, 'wrong')).rejects.toThrow(InvalidCredentialsError);
      expect(sessions.issue).not.toHaveBeenCalled();
    }
  );

  it('verification reads current state without issuing or renewing a JWT', async () => {
    const snapshot = { ...user };
    users.findById.mockResolvedValue(snapshot);
    await expect(module.get(VerifySessionUseCase).execute('session')).resolves.toEqual(user);
    expect(snapshot).toEqual(user);
    expect(users.findById).toHaveBeenCalledWith(user.id);
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('rejects an absent cookie without querying Users', async () => {
    await expect(module.get(VerifySessionUseCase).execute('')).rejects.toThrow(InvalidSessionError);
    expect(users.findById).not.toHaveBeenCalled();
  });

  it.each(['invalid', 'expired'])('rejects %s session signatures without reading accounts', async () => {
    sessions.verify.mockRejectedValue(new InvalidSessionError());
    await expect(module.get(RefreshSessionUseCase).execute('bad')).rejects.toThrow(InvalidSessionError);
    expect(users.findById).not.toHaveBeenCalled();
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('rejects a deleted user', async () => {
    users.findById.mockResolvedValue(null);
    await expect(module.get(VerifySessionUseCase).execute('session')).rejects.toThrow(InvalidSessionError);
  });

  it.each(['inactive-user', 'inactive-clinic'])('rejects current %s with an otherwise valid token', async failure => {
    if (failure === 'inactive-user') users.findById.mockResolvedValue({ ...user, status: 'inactive' });
    else clinics.isActive.mockResolvedValue(false);
    await expect(module.get(VerifySessionUseCase).execute('session')).rejects.toThrow(InactiveAccountError);
    await expect(module.get(RefreshSessionUseCase).execute('session')).rejects.toThrow(InvalidSessionError);
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('renews a valid session with current account checks and no refresh token', async () => {
    await expect(module.get(RefreshSessionUseCase).execute('current')).resolves.toBe('signed-session');
    expect(sessions.verify).toHaveBeenCalledWith('current');
    expect(sessions.issue).toHaveBeenCalledWith(user.id);
  });
});
