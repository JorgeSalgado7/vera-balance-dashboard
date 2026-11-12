import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case'
import { ForgotPasswordDto } from '../../../application/dtos/forgot-password.dto'
import { ForgotPasswordResponseDto } from '../../../application/dtos/forgot-password-response.dto'

@Controller('auth')
@ApiTags('Auth')
export class ForgotPasswordController {
  constructor(private readonly useCase: ForgotPasswordUseCase) {}

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código de recuperación', operationId: 'forgotPassword' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, type: ForgotPasswordResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 500 })
  execute(@Body() dto: ForgotPasswordDto): ForgotPasswordResponseDto {
    return this.useCase.execute(dto)
  }
}
