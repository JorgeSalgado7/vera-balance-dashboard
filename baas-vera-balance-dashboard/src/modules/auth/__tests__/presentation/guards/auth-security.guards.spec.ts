import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from '../../../presentation/guards/csrf.guard';
import { AuthRateLimitGuard } from '../../../presentation/guards/auth-rate-limit.guard';

describe('Auth security guards', () => {
  let module: TestingModule;
  const context = (origin?: string, ip = '127.0.0.1', email = 'user@example.com', path = '/v1/auth/sign-in') => ({
    switchToHttp: () => ({
      getRequest: () => ({ get: () => origin, ip, body: { email }, path, originalUrl: path })
    })
  } as unknown as ExecutionContext);

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(0);
    module = await Test.createTestingModule({
      providers: [
        CsrfGuard, AuthRateLimitGuard,
        { provide: ConfigService, useValue: new ConfigService({
          AUTH_ALLOWED_ORIGINS: 'https://dashboard.example.com',
          AUTH_RATE_LIMIT: 2, AUTH_RATE_WINDOW_MS: 1000
        }) }
      ]
    }).compile();
  });
  afterEach(async () => { jest.useRealTimers(); await module.close(); });

  it('allows an exact configured origin', () => {
    expect(module.get(CsrfGuard).canActivate(context('https://dashboard.example.com'))).toBe(true);
  });

  it.each([undefined, 'null', 'https://attacker.example.com', 'https://dashboard.example.com.attacker.test'])(
    'rejects unsafe or absent origins: %s', origin => {
      expect(() => module.get(CsrfGuard).canActivate(context(origin))).toThrow();
    }
  );

  it('rate-limits repeated requests and resets after the configured window', () => {
    const guard = module.get(AuthRateLimitGuard);
    guard.canActivate(context());
    guard.canActivate(context());
    try { guard.canActivate(context()); throw new Error('Expected 429'); }
    catch (error) { expect((error as { getStatus(): number }).getStatus()).toBe(429); }
    jest.advanceTimersByTime(1000);
    expect(guard.canActivate(context())).toBe(true);
  });

  it('limits a normalized account across IPs and an IP across accounts', () => {
    const guard = module.get(AuthRateLimitGuard);
    guard.canActivate(context(undefined, 'ip-a', ' USER@EXAMPLE.COM '));
    guard.canActivate(context(undefined, 'ip-b', 'user@example.com'));
    expect(() => guard.canActivate(context(undefined, 'ip-c', 'user@example.com'))).toThrow();
    guard.canActivate(context(undefined, 'ip-x', 'account-a@example.com'));
    guard.canActivate(context(undefined, 'ip-x', 'account-b@example.com'));
    expect(() => guard.canActivate(context(undefined, 'ip-x', 'account-c@example.com'))).toThrow();
  });

  it('keeps separate limits for sign-in and recovery routes', () => {
    const guard = module.get(AuthRateLimitGuard);
    guard.canActivate(context());
    guard.canActivate(context());
    expect(guard.canActivate(context(undefined, '127.0.0.1', 'user@example.com', '/v1/auth/forgot-password'))).toBe(true);
  });
});
