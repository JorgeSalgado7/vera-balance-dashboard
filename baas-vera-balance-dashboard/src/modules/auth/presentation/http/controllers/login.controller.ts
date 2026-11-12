import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoginUseCase } from '../../../application/use-cases/login.use-case'
import { LoginDto } from '../../../application/dtos/login.dto'
import { LoginResponseDto } from '../../../application/dtos/login-response.dto'
import { AuthErrorTranslator } from '../errors/auth-error.translator'

@Controller('auth')
@ApiTags('Auth')
export class LoginController {
  constructor(private readonly useCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', operationId: 'login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 429 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      AuthErrorTranslator.translate(error, '/auth/login')
      throw error
    }
  }
}
