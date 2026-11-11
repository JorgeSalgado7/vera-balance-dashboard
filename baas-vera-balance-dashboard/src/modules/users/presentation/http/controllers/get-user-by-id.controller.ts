import { Controller, Get, Inject, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case'
import { GetUserByIdResponseDto } from '../../../application/dtos/get-user-by-id-response.dto'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
export class GetUserByIdController {
  constructor(@Inject(GetUserByIdUseCase) private readonly useCase: GetUserByIdUseCase) {}

  @Get(':userId')
  @ApiOperation({ operationId: 'getUser', summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'userId', required: true, description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: GetUserByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('userId') userId: string): Promise<GetUserByIdResponseDto> {
    try {
      return await this.useCase.execute(userId)
    } catch (error) {
      UserErrorTranslator.translate(error, `/users/${userId}`)
      throw error
    }
  }
}
