import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RefreshUseCase } from '../../../application/use-cases/refresh.use-case'
import { RefreshDto } from '../../../application/dtos/refresh.dto'
import { RefreshResponseDto } from '../../../application/dtos/refresh-response.dto'
import { AuthErrorTranslator } from '../errors/auth-error.translator'

@Controller('auth')
@ApiTags('Auth')
export class RefreshController {
  constructor(private readonly useCase: RefreshUseCase) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar sesión', operationId: 'refreshSession' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, type: RefreshResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: RefreshDto): Promise<RefreshResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      AuthErrorTranslator.translate(error, '/auth/refresh')
      throw error
    }
  }
}
