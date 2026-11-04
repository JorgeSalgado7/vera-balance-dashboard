import { Controller, Delete, HttpCode, Inject, Param } from '@nestjs/common'
import { CurrentUser } from '@nestjs/authentication'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case'
import type { UserRole } from '../../../../../constants/user-roles.constant'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
export class DeleteUserController {
  constructor(@Inject(DeleteUserUseCase) private readonly useCase: DeleteUserUseCase) {}

  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteUser', summary: 'Eliminar usuario' })
  @ApiParam({ name: 'userId', required: true, description: 'ID del usuario', type: String })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('userId') userId: string, @CurrentUser() actor: { role: UserRole }): Promise<void> {
    try {
      await this.useCase.execute(userId, actor)
    } catch (error) {
      UserErrorTranslator.translate(error, `/users/${userId}`)
      throw error
    }
  }
}
