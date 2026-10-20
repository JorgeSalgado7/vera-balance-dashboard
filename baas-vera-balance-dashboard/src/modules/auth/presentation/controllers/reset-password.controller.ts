import { Body, Controller, HttpCode, Post, Req, UseGuards, Version } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { ResetPasswordDto } from '../../application/dtos/reset-password.dto';
import { CsrfGuard } from '../../../../shared/http-security/csrf.guard';
import { readSessionCookie } from '../http/session-cookie';
import { SessionValidatedByUseCase } from '../decorators/session-validated-by-use-case.decorator';

@Controller('auth')
@ApiTags('Auth')
export class ResetPasswordController {
  constructor(private readonly resetPassword: ResetPasswordUseCase) {}

  @Version('1')
  @Post('reset-password')
  @SessionValidatedByUseCase()
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  @ApiCookieAuth('vera_balance_session')
  @ApiOperation({ summary: 'Change the authenticated user password' })
  @ApiResponse({ status: 200 })
  execute(@Req() request: Request, @Body() dto: ResetPasswordDto) {
    return this.resetPassword.execute(
      readSessionCookie(request), dto.password, dto.password_confirmation
    );
  }
}
