import { Controller, HttpCode, Post, Res, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CsrfGuard } from '../../../../shared/http-security/csrf.guard';
import { clearSessionCookie } from '../http/session-cookie';
import { PublicAuthOperation } from '../decorators/public-auth-operation.decorator';

@Controller('auth')
@ApiTags('Auth')
export class SignOutController {
  @Version('1')
  @Post('sign-out')
  @PublicAuthOperation()
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Sign out, including expired sessions' })
  @ApiResponse({ status: 204 })
  execute(@Res({ passthrough: true }) response: Response): void {
    clearSessionCookie(response);
  }
}
