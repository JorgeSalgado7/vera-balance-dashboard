import { Body, Controller, HttpCode, Post, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordResetUseCase } from '../../application/use-cases/forgot-password-reset.use-case';
import { ForgotPasswordResetDto } from '../../application/dtos/forgot-password-reset.dto';
import { AuthRateLimitGuard } from '../guards/auth-rate-limit.guard';
import { PublicAuthOperation } from '../decorators/public-auth-operation.decorator';

@Controller('auth')
@ApiTags('Auth')
export class ForgotPasswordResetController {
  constructor(private readonly resetPassword: ForgotPasswordResetUseCase) {}

  @Version('1')
  @Post('forgot-password/reset')
  @PublicAuthOperation()
  @HttpCode(200)
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Reset a forgotten password without starting a session' })
  @ApiResponse({ status: 200 })
  execute(@Body() dto: ForgotPasswordResetDto) {
    return this.resetPassword.execute(
      dto.email, dto.verification_code, dto.password, dto.password_confirmation
    );
  }
}
