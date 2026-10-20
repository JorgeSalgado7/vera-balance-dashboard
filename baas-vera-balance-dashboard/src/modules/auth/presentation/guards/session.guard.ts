import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { VerifySessionUseCase } from '../../application/use-cases/verify-session.use-case';
import { PUBLIC_AUTH_OPERATION } from '../decorators/public-auth-operation.decorator';
import { USE_CASE_SESSION_VALIDATION } from '../decorators/session-validated-by-use-case.decorator';
import { readSessionCookie } from '../http/session-cookie';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifySession: VerifySessionUseCase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_AUTH_OPERATION, [
      context.getHandler(), context.getClass()
    ])) return true;

    if (this.reflector.getAllAndOverride<boolean>(USE_CASE_SESSION_VALIDATION, [
      context.getHandler(), context.getClass()
    ])) return true;

    const request = context.switchToHttp().getRequest<Request & {
      authenticatedUser?: { id: string; role: string; status: string; clinicId: string };
    }>();
    const user = await this.verifySession.execute(readSessionCookie(request));
    request.authenticatedUser = {
      id: user.id, role: user.role, status: user.status, clinicId: user.clinicId
    };
    return true;
  }
}
