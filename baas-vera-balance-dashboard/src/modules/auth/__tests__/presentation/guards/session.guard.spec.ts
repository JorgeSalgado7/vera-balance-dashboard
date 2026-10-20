import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { SessionGuard } from '../../../presentation/guards/session.guard';
import { VerifySessionUseCase } from '../../../application/use-cases/verify-session.use-case';
import { ValidateAuthAccountService } from '../../../application/services/validate-auth-account.service';
import { InvalidSessionError, InactiveAccountError } from '../../../domain/errors/auth.error';

describe('Global SessionGuard', () => {
  let module: TestingModule;
  const users = { findById: jest.fn() };
  const sessions = { verify: jest.fn() };
  const clinics = { isActive: jest.fn() };
  const reflector = { getAllAndOverride: jest.fn() };
  const user = {
    id: 'user', email: 'user@example.com', clinicId: 'clinic', role: 'therapist',
    status: 'active', passwordHash: 'private-hash'
  };

  const context = (request: object) => ({
    getHandler: () => function protectedHandler() {},
    getClass: () => class ProtectedController {},
    switchToHttp: () => ({ getRequest: () => request })
  } as unknown as ExecutionContext);

  beforeEach(async () => {
    jest.resetAllMocks();
    users.findById.mockResolvedValue(user);
    sessions.verify.mockResolvedValue(user.id);
    clinics.isActive.mockResolvedValue(true);
    reflector.getAllAndOverride.mockReturnValue(false);
    module = await Test.createTestingModule({
      providers: [
        SessionGuard, VerifySessionUseCase, ValidateAuthAccountService,
        { provide: Reflector, useValue: reflector },
        { provide: 'AuthUserReaderPort', useValue: users },
        { provide: 'SessionPort', useValue: sessions },
        { provide: 'AuthClinicReaderPort', useValue: clinics }
      ]
    }).compile();
  });
  afterEach(async () => { await module.close(); });

  it('requires authentication by default for existing protected modules', async () => {
    await expect(module.get(SessionGuard).canActivate(context({ headers: {} }))).rejects.toThrow(InvalidSessionError);
    expect(users.findById).not.toHaveBeenCalled();
  });

  it('passes only public identity data to the request after current-state checks', async () => {
    const request = { headers: { cookie: 'vera_balance_session=valid-jwt' } };
    await expect(module.get(SessionGuard).canActivate(context(request))).resolves.toBe(true);
    expect(request).toEqual({
      headers: { cookie: 'vera_balance_session=valid-jwt' },
      authenticatedUser: { id: 'user', role: 'therapist', status: 'active', clinicId: 'clinic' }
    });
    expect(JSON.stringify(request)).not.toContain('private-hash');
  });

  it('rejects a previously authenticated user after deactivation, even with a valid signature', async () => {
    users.findById.mockResolvedValue({ ...user, status: 'inactive' });
    await expect(module.get(SessionGuard).canActivate(context({
      headers: { cookie: 'vera_balance_session=still-valid-jwt' }
    }))).rejects.toThrow(InactiveAccountError);
  });

  it('allows only explicitly public operations without looking up a user', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    await expect(module.get(SessionGuard).canActivate(context({ headers: {} }))).resolves.toBe(true);
    expect(sessions.verify).not.toHaveBeenCalled();
    expect(users.findById).not.toHaveBeenCalled();
  });
});
