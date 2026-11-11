import { Body, Controller, Inject, Param, Patch } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UpdateUserStatusUseCase } from '../../../application/use-cases/update-user-status.use-case'
import { UpdateUserStatusDto } from '../../../application/dtos/update-user-status.dto'
import { UpdateUserStatusResponseDto } from '../../../application/dtos/update-user-status-response.dto'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
export class UpdateUserStatusController {
  constructor(@Inject(UpdateUserStatusUseCase) private readonly useCase: UpdateUserStatusUseCase) {}

  @Patch(':userId/status')
  @ApiOperation({ operationId: 'updateUserStatus', summary: 'Actualizar estatus del usuario' })
  @ApiParam({ name: 'userId', required: true, description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Estatus actualizado', type: UpdateUserStatusResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UpdateUserStatusResponseDto> {
    try {
      return await this.useCase.execute(userId, dto)
    } catch (error) {
      UserErrorTranslator.translate(error, `/users/${userId}/status`)
      throw error
    }
  }
}
