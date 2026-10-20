import { Body, Controller, HttpCode, Post, Res, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { SignInDto } from '../../application/dtos/sign-in.dto';
import { AuthSessionResponseDto } from '../../application/dtos/auth-session-response.dto';
import { AuthRateLimitGuard } from '../guards/auth-rate-limit.guard';
import { CsrfGuard } from '../guards/csrf.guard';
import { setSessionCookie } from '../http/session-cookie';
import { PublicAuthOperation } from '../decorators/public-auth-operation.decorator';

@Controller('auth')
@ApiTags('Auth')
export class SignInController {
  constructor(private readonly signIn: SignInUseCase) {}

  @Version('1')
  @Post('sign-in')
  @PublicAuthOperation()
  @HttpCode(200)
  @UseGuards(CsrfGuard, AuthRateLimitGuard)
  @ApiOperation({ summary: 'Sign in' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  async execute(@Body() dto: SignInDto, @Res({ passthrough: true }) response: Response) {
    setSessionCookie(response, await this.signIn.execute(dto.email, dto.password));
    return { authenticated: true };
  }
}
