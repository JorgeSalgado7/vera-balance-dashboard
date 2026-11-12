import { Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case'
import { InvalidAccessTokenError } from '../../../domain/errors/auth.error'
import { AuthErrorTranslator } from '../errors/auth-error.translator'

@Controller('auth')
@ApiTags('Auth')
export class LogoutController {
  constructor(private readonly useCase: LogoutUseCase) {}

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Cerrar sesión', operationId: 'logout' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada' })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 500 })
  async execute(@Headers('authorization') authorization?: string): Promise<void> {
    try {
      const bearer = typeof authorization === 'string' ? /^Bearer[ \t]+([^\s]+)$/i.exec(authorization) : null
      if (!bearer) throw new InvalidAccessTokenError()
      await this.useCase.execute(bearer[1])
    } catch (error) {
      AuthErrorTranslator.translate(error, '/auth/logout')
      throw error
    }
  }
}
