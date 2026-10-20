import type { Request, Response } from 'express';
import { readSessionCookie, setSessionCookie, clearSessionCookie } from '../../../presentation/http/session-cookie';

describe('Session cookie HTTP boundary', () => {
  it('reads only the exact session cookie and rejects ambiguous duplicate credentials', () => {
    const read = (cookie: string) => readSessionCookie({ headers: { cookie } } as Request);
    expect(read('other=value; vera_balance_session=jwt')).toBe('jwt');
    expect(read('vera_balance_session_suffix=jwt')).toBe('');
    expect(read('vera_balance_session=a; vera_balance_session=b')).toBe('');
    expect(read('')).toBe('');
    expect(read('vera_balance_session=')).toBe('');
  });

  it('sets HttpOnly, Secure, Lax, root scope and exactly five minutes', () => {
    const response = { cookie: jest.fn() };
    setSessionCookie(response as unknown as Response, 'jwt');
    expect(response.cookie).toHaveBeenCalledWith('vera_balance_session', 'jwt', {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 300_000
    });
  });

  it('expires the same cookie scope without requiring a valid JWT or changing user data', () => {
    const response = { cookie: jest.fn() };
    clearSessionCookie(response as unknown as Response);
    expect(response.cookie).toHaveBeenCalledWith('vera_balance_session', '', {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0, expires: new Date(0)
    });
  });
});
