import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common'
import { CurrentUser } from '@nestjs/authentication'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case'
import type { GetUserByIdActor } from '../../../domain/services/validate-get-user-by-id.domain-service'
import { GetUserByIdResponseDto } from '../../../application/dtos/get-user-by-id-response.dto'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
export class GetUserByIdController {
  constructor(@Inject(GetUserByIdUseCase) private readonly useCase: GetUserByIdUseCase) {}

  @Get(':userId')
  @ApiOperation({ operationId: 'getUser', summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID del usuario', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: GetUserByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('userId', new ParseUUIDPipe({ version: 'all' })) userId: string, @CurrentUser() actor: GetUserByIdActor): Promise<GetUserByIdResponseDto> {
    try {
      return await this.useCase.execute(userId, actor)
    } catch (error) {
      UserErrorTranslator.translate(error, `/users/${userId}`)
      throw error
    }
  }
}
