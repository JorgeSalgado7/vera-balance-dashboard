import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { HttpProblem } from '../../../../shared/http-problem/http-problem.util';

export const AuthenticatedUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthenticatedUserContext => {
  const request = context.switchToHttp().getRequest<Request & { authenticatedUser?: AuthenticatedUserContext }>();
  if (!request.authenticatedUser) throw HttpProblem.unauthorized('Authentication is required.', request.originalUrl);
  return request.authenticatedUser;
});
