import type { Request, Response } from 'express';

const name = 'vera_balance_session';
const attributes = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' };

export function readSessionCookie(request: Request): string {
  const cookies = (request.headers.cookie ?? '').split(';')
    .map(cookie => cookie.trim()).filter(cookie => cookie.startsWith(name + '='));
  if (cookies.length !== 1) return '';
  return cookies[0].slice(name.length + 1);
}

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(name, token, { ...attributes, maxAge: 300_000 });
}

export function clearSessionCookie(response: Response): void {
  response.cookie(name, '', { ...attributes, maxAge: 0, expires: new Date(0) });
}
