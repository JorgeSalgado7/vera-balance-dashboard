import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case'
import { ResetPasswordDto } from '../../../application/dtos/reset-password.dto'
import { ResetPasswordResponseDto } from '../../../application/dtos/reset-password-response.dto'
import { AuthErrorTranslator } from '../errors/auth-error.translator'

@Controller('auth')
@ApiTags('Auth')
export class ResetPasswordController {
  constructor(private readonly useCase: ResetPasswordUseCase) {}

  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña', operationId: 'resetPassword' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, type: ResetPasswordResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 429 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      AuthErrorTranslator.translate(error, '/auth/forgot-password/reset')
      throw error
    }
  }
}
