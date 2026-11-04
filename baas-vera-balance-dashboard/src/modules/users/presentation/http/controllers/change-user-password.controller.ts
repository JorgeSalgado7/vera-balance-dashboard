import { Body, Controller, Inject, Param, Patch } from '@nestjs/common'
import { CurrentUser } from '@nestjs/authentication'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChangeUserPasswordUseCase } from '../../../application/use-cases/change-user-password.use-case'
import { ChangeUserPasswordDto } from '../../../application/dtos/change-user-password.dto'
import { ChangeUserPasswordResponseDto } from '../../../application/dtos/change-user-password-response.dto'
import type { UserRole } from '../../../../../constants/user-roles.constant'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
export class ChangeUserPasswordController {
  constructor(@Inject(ChangeUserPasswordUseCase) private readonly useCase: ChangeUserPasswordUseCase) {}

  @Patch(':userId/password')
  @ApiOperation({ operationId: 'changeUserPassword', summary: 'Cambiar contraseña' })
  @ApiParam({ name: 'userId', required: true, description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada', type: ChangeUserPasswordResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(
    @Param('userId') userId: string,
    @Body() dto: ChangeUserPasswordDto,
    @CurrentUser() actor: { id: string; role: UserRole },
  ): Promise<ChangeUserPasswordResponseDto> {
    try {
      return await this.useCase.execute(userId, dto, actor)
    } catch (error) {
      UserErrorTranslator.translate(error, `/users/${userId}/password`)
      throw error
    }
  }
}
