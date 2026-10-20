import { Body, Controller, HttpCode, Post, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ForgotPasswordDto } from '../../application/dtos/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../../application/dtos/forgot-password-response.dto';
import { AuthRateLimitGuard } from '../guards/auth-rate-limit.guard';
import { PublicAuthOperation } from '../decorators/public-auth-operation.decorator';

@Controller('auth')
@ApiTags('Auth')
export class ForgotPasswordController {
  constructor(private readonly forgotPassword: ForgotPasswordUseCase) {}

  @Version('1')
  @Post('forgot-password')
  @PublicAuthOperation()
  @HttpCode(202)
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Request password recovery' })
  @ApiResponse({ status: 202, type: ForgotPasswordResponseDto })
  execute(@Body() dto: ForgotPasswordDto) {
    return this.forgotPassword.execute(dto.email);
  }
}
