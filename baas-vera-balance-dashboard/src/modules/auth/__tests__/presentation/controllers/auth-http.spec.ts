import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from '../../../presentation/guards/session.guard';
import request from 'supertest';
import { HttpProblemFilter } from '../../../../../shared/http-problem/http-problem.filter';
import { SignInController } from '../../../presentation/controllers/sign-in.controller';
import { SignOutController } from '../../../presentation/controllers/sign-out.controller';
import { VerifySessionController } from '../../../presentation/controllers/verify-session.controller';
import { RefreshSessionController } from '../../../presentation/controllers/refresh-session.controller';
import { ResetPasswordController } from '../../../presentation/controllers/reset-password.controller';
import { ForgotPasswordController } from '../../../presentation/controllers/forgot-password.controller';
import { ForgotPasswordResetController } from '../../../presentation/controllers/forgot-password-reset.controller';
import { SignInUseCase } from '../../../application/use-cases/sign-in.use-case';
import { VerifySessionUseCase } from '../../../application/use-cases/verify-session.use-case';
import { RefreshSessionUseCase } from '../../../application/use-cases/refresh-session.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case';
import { ForgotPasswordResetUseCase } from '../../../application/use-cases/forgot-password-reset.use-case';
import { ValidateAuthAccountService } from '../../../application/services/validate-auth-account.service';
import { ValidatePasswordDomainService } from '../../../domain/services/validate-password.domain-service';
import { ValidatePasswordRecoveryDomainService } from '../../../domain/services/validate-password-recovery.domain-service';
import { ConfiguredPasswordPolicyAdapter } from '../../../infrastructure/providers/configured-password-policy.adapter';
import { AuthRateLimitGuard } from '../../../presentation/guards/auth-rate-limit.guard';
import { CsrfGuard } from '../../../presentation/guards/csrf.guard';
import { InvalidSessionError } from '../../../domain/errors/auth.error';

describe('Auth HTTP contracts', () => {
  let app: INestApplication;
  let module: TestingModule;
  const origin = 'https://dashboard.example.com';
  const user = {
    id: 'user', email: 'user@example.com', passwordHash: 'stored-secret',
    status: 'active', role: 'clinic', clinicId: 'clinic'
  };
  const users = { findById: jest.fn(), findByEmail: jest.fn() };
  const clinics = { isActive: jest.fn() };
  const passwords = { hash: jest.fn(), verify: jest.fn() };
  const sessions = { issue: jest.fn(), verify: jest.fn() };
  const writer = { update: jest.fn() };
  const codes = { generate: jest.fn(), protect: jest.fn(), matches: jest.fn() };
  const recovery = { save: jest.fn(), findByUserId: jest.fn(), register: jest.fn(), consume: jest.fn() };
  const email = { send: jest.fn() };
  const newPassword = 'test-password-long-enough';

  beforeEach(async () => {
    jest.resetAllMocks();
    users.findById.mockResolvedValue(user);
    users.findByEmail.mockResolvedValue(user);
    clinics.isActive.mockResolvedValue(true);
    passwords.verify.mockResolvedValue(true);
    passwords.hash.mockResolvedValue('new-hash');
    sessions.issue.mockResolvedValue('signed-session');
    sessions.verify.mockImplementation(async (token: string) => {
      if (token !== 'valid-session') throw new InvalidSessionError();
      return user.id;
    });
    codes.generate.mockReturnValue('123456');
    codes.protect.mockReturnValue('protected-code');
    codes.matches.mockReturnValue(true);
    recovery.consume.mockResolvedValue(true);
    recovery.findByUserId.mockResolvedValue({
      userId: 'user', codeHash: 'protected-code', attempts: 0,
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 300_000).toISOString(), ttl: 1
    });
    module = await Test.createTestingModule({
      controllers: [
        SignInController, SignOutController, VerifySessionController, RefreshSessionController,
        ResetPasswordController, ForgotPasswordController, ForgotPasswordResetController
      ],
      providers: [
        { provide: APP_GUARD, useClass: SessionGuard },
        SignInUseCase, VerifySessionUseCase, RefreshSessionUseCase, ResetPasswordUseCase,
        ForgotPasswordUseCase, ForgotPasswordResetUseCase, ValidateAuthAccountService,
        ValidatePasswordDomainService, ValidatePasswordRecoveryDomainService, CsrfGuard, AuthRateLimitGuard,
        { provide: ConfigService, useValue: new ConfigService({
          AUTH_ALLOWED_ORIGINS: origin, AUTH_RATE_LIMIT: 2, AUTH_RATE_WINDOW_MS: 60_000,
          AUTH_PASSWORD_MIN_LENGTH: 12
        }) },
        { provide: 'PasswordPolicyProvider', useClass: ConfiguredPasswordPolicyAdapter },
        { provide: 'AuthUserReaderPort', useValue: users },
        { provide: 'AuthClinicReaderPort', useValue: clinics },
        { provide: 'PasswordHasherPort', useValue: passwords },
        { provide: 'SessionPort', useValue: sessions },
        { provide: 'UserPasswordWriterPort', useValue: writer },
        { provide: 'RecoveryCodePort', useValue: codes },
        { provide: 'RecoveryEmailPort', useValue: email },
        { provide: 'ISavePasswordRecoveryRepository', useValue: recovery },
        { provide: 'IFindPasswordRecoveryRepository', useValue: recovery },
        { provide: 'IRegisterRecoveryAttemptRepository', useValue: recovery },
        { provide: 'IConsumePasswordRecoveryRepository', useValue: recovery }
      ]
    }).compile();
    app = module.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new HttpProblemFilter());
    await app.init();
  });

  afterEach(async () => { await app.close(); });

  it('returns only authenticated=true and the exact secure session cookie on sign-in', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/sign-in')
      .set('Origin', origin).send({ email: user.email, password: 'password' }).expect(200);
    expect(response.body).toEqual({ authenticated: true });
    const cookie = String(response.headers['set-cookie']);
    for (const attribute of ['vera_balance_session=signed-session', 'Max-Age=300', 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax']) {
      expect(cookie).toContain(attribute);
    }
    expect(JSON.stringify(response.body)).not.toContain(user.passwordHash);
  });

  it('rejects invalid input before credential queries', async () => {
    await request(app.getHttpServer()).post('/v1/auth/sign-in')
      .set('Origin', origin).send({ email: 'invalid', password: '' }).expect(400);
    expect(users.findByEmail).not.toHaveBeenCalled();
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('preserves a structured 429 status through the global error filter', async () => {
    for (let index = 0; index < 2; index++) {
      await request(app.getHttpServer()).post('/v1/auth/sign-in')
        .set('Origin', origin).send({ email: user.email, password: 'password' }).expect(200);
    }
    const response = await request(app.getHttpServer()).post('/v1/auth/sign-in')
      .set('Origin', origin).send({ email: user.email, password: 'password' }).expect(429);
    expect(response.body.status).toBe(429);
    expect(response.body.instance).toBe('/v1/auth/sign-in');
  });

  it.each(['', 'vera_balance_session=expired', 'other=value'])('rejects a missing/invalid session for cookie %s', async cookie => {
    await request(app.getHttpServer()).post('/v1/auth/verify').set('Cookie', cookie).expect(401);
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('verifies without setting a cookie, renewing a JWT, or exposing user details', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/verify')
      .set('Cookie', 'vera_balance_session=valid-session').expect(200);
    expect(response.body).toEqual({ authenticated: true });
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('refreshes only a live session and replaces the session cookie', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/refresh')
      .set('Origin', origin).set('Cookie', 'vera_balance_session=valid-session').expect(200);
    expect(response.body).toEqual({ authenticated: true });
    expect(String(response.headers['set-cookie'])).toContain('Max-Age=300');
  });

  it('does not exempt protected Auth use cases from expired-session checks', async () => {
    await request(app.getHttpServer()).post('/v1/auth/refresh')
      .set('Origin', origin).set('Cookie', 'vera_balance_session=expired').expect(401);
    await request(app.getHttpServer()).post('/v1/auth/reset-password')
      .set('Origin', origin)
      .send({ password: newPassword, password_confirmation: newPassword }).expect(401);
    expect(sessions.issue).not.toHaveBeenCalled();
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('uses the refresh contract 401 when the current user has been deactivated', async () => {
    users.findById.mockResolvedValue({ ...user, status: 'inactive' });
    await request(app.getHttpServer()).post('/v1/auth/refresh')
      .set('Origin', origin).set('Cookie', 'vera_balance_session=valid-session').expect(401);
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('clears an expired cookie without accessing the database or validating a JWT', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/sign-out')
      .set('Origin', origin).set('Cookie', 'vera_balance_session=expired').expect(204);
    expect(response.text).toBe('');
    expect(String(response.headers['set-cookie'])).toContain('Max-Age=0');
    expect(sessions.verify).not.toHaveBeenCalled();
    expect(users.findById).not.toHaveBeenCalled();
  });

  it.each(['sign-out', 'refresh', 'reset-password'])('rejects unauthorized origins on %s', async route => {
    await request(app.getHttpServer()).post('/v1/auth/' + route)
      .set('Origin', 'https://attacker.example.com').set('Cookie', 'vera_balance_session=valid-session')
      .send({ password: newPassword, password_confirmation: newPassword }).expect(403);
    expect(writer.update).not.toHaveBeenCalled();
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('changes only the session account and returns no credentials or new JWT', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/reset-password')
      .set('Origin', origin).set('Cookie', 'vera_balance_session=valid-session')
      .send({ password: newPassword, password_confirmation: newPassword }).expect(200);
    expect(response.text).toBe('');
    expect(writer.update).toHaveBeenCalledWith(user, 'new-hash');
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('rejects client-selected identities in password changes', async () => {
    await request(app.getHttpServer()).post('/v1/auth/reset-password')
      .set('Origin', origin).set('Cookie', 'vera_balance_session=valid-session')
      .send({ user_id: 'other', password: newPassword, password_confirmation: newPassword }).expect(400);
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('returns an equivalent accepted recovery response for existing and missing accounts', async () => {
    const first = await request(app.getHttpServer()).post('/v1/auth/forgot-password')
      .send({ email: user.email }).expect(202);
    users.findByEmail.mockResolvedValue(null);
    const second = await request(app.getHttpServer()).post('/v1/auth/forgot-password')
      .send({ email: 'unknown@example.com' }).expect(202);
    expect(first.body).toEqual({ accepted: true });
    expect(second.body).toEqual(first.body);
    expect(first.headers['set-cookie']).toBeUndefined();
  });

  it('accepts the OpenAPI recovery field without setting a session or returning secrets', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/forgot-password/reset')
      .send({ email: user.email, verification_code: '123456', password: newPassword, password_confirmation: newPassword })
      .expect(200);
    expect(response.text).toBe('');
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(recovery.consume).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user' }), user, 'new-hash');
    expect(sessions.issue).not.toHaveBeenCalled();
  });
});
