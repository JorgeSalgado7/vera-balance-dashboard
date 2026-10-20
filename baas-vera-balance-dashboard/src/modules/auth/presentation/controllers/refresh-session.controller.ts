import { Controller, HttpCode, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { AuthSessionResponseDto } from '../../application/dtos/auth-session-response.dto';
import { CsrfGuard } from '../guards/csrf.guard';
import { readSessionCookie, setSessionCookie } from '../http/session-cookie';
import { SessionValidatedByUseCase } from '../decorators/session-validated-by-use-case.decorator';

@Controller('auth')
@ApiTags('Auth')
export class RefreshSessionController {
  constructor(private readonly refreshSession: RefreshSessionUseCase) {}

  @Version('1')
  @Post('refresh')
  @SessionValidatedByUseCase()
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  @ApiCookieAuth('vera_balance_session')
  @ApiOperation({ summary: 'Refresh a valid session' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async execute(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    setSessionCookie(response, await this.refreshSession.execute(readSessionCookie(request)));
    return { authenticated: true };
  }
}
