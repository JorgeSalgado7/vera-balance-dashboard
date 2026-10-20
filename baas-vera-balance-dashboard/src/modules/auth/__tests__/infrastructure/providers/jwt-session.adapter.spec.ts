import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { JwtSessionAdapter } from '../../../infrastructure/providers/jwt-session.adapter';
import { InvalidSessionError } from '../../../domain/errors/auth.error';

describe('JwtSessionAdapter', () => {
  let module: TestingModule;
  let adapter: JwtSessionAdapter;
  const secret = 'test-session-secret-with-at-least-32-bytes';

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-19T12:00:00Z'));
    module = await Test.createTestingModule({
      providers: [JwtSessionAdapter, { provide: ConfigService, useValue: new ConfigService({ AUTH_SESSION_SECRET: secret }) }]
    }).compile();
    adapter = module.get(JwtSessionAdapter);
  });
  afterEach(async () => { jest.useRealTimers(); await module.close(); });

  it('issues signed JWTs containing only identity and five-minute validity', async () => {
    const token = await adapter.issue('user');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    expect(payload).toEqual({ sub: 'user', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 300 });
    await expect(adapter.verify(token)).resolves.toBe('user');
  });

  it('expires at exactly five minutes', async () => {
    const token = await adapter.issue('user');
    jest.advanceTimersByTime(300_000);
    await expect(adapter.verify(token)).rejects.toThrow(InvalidSessionError);
  });

  it.each(['', 'garbage', 'a.b.c', 'a.b.c.d'])('rejects malformed input %s', async input => {
    await expect(adapter.verify(input)).rejects.toThrow(InvalidSessionError);
  });

  it('rejects a modified payload', async () => {
    const [header, , signature] = (await adapter.issue('user')).split('.');
    const payload = Buffer.from(JSON.stringify({ sub: 'other' })).toString('base64url');
    await expect(adapter.verify(`${header}.${payload}.${signature}`)).rejects.toThrow(InvalidSessionError);
  });

  it.each([
    { header: { alg: 'none', typ: 'JWT' }, claims: { sub: 'user', iat: 1, exp: 301 } },
    { header: { alg: 'HS512', typ: 'JWT' }, claims: { sub: 'user', iat: 1, exp: 301 } },
    { header: { alg: 'HS256', typ: 'JWT', crit: ['x'] }, claims: { sub: 'user', iat: 1, exp: 301 } },
    { header: { alg: 'HS256', typ: 'JWT' }, claims: { sub: 'user', iat: '1', exp: 301 } },
    { header: { alg: 'HS256', typ: 'JWT' }, claims: { sub: '', iat: 1, exp: 301 } }
  ])('rejects signed tokens with invalid algorithm or claims', async ({ header, claims }) => {
    const now = Math.floor(Date.now() / 1000);
    const currentClaims = {
      ...claims,
      iat: typeof claims.iat === 'number' ? now : claims.iat,
      exp: now + 300
    };
    const data = Buffer.from(JSON.stringify(header)).toString('base64url')
      + '.' + Buffer.from(JSON.stringify(currentClaims)).toString('base64url');
    const signature = createHmac('sha256', secret).update(data).digest('base64url');
    await expect(adapter.verify(data + '.' + signature)).rejects.toThrow(InvalidSessionError);
  });
});
