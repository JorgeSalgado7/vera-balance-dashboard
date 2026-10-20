import { Controller, HttpCode, Post, Req, Version } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { VerifySessionUseCase } from '../../application/use-cases/verify-session.use-case';
import { AuthSessionResponseDto } from '../../application/dtos/auth-session-response.dto';
import { readSessionCookie } from '../http/session-cookie';
import { SessionValidatedByUseCase } from '../decorators/session-validated-by-use-case.decorator';

@Controller('auth')
@ApiTags('Auth')
export class VerifySessionController {
  constructor(private readonly verifySession: VerifySessionUseCase) {}

  @Version('1')
  @Post('verify')
  @SessionValidatedByUseCase()
  @HttpCode(200)
  @ApiCookieAuth('vera_balance_session')
  @ApiOperation({ summary: 'Verify session without renewing it' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async execute(@Req() request: Request) {
    await this.verifySession.execute(readSessionCookie(request));
    return { authenticated: true };
  }
}
