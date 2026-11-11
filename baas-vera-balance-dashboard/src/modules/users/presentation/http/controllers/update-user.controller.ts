import { Body, Controller, Inject, Param, Patch } from '@nestjs/common'
import { ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger'
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case'
import { UpdateUserDto } from '../../../application/dtos/update-user.dto'
import { UpdateUserResponseDto } from '../../../application/dtos/update-user-response.dto'
import { UserErrorTranslator } from '../errors/user-error.translator'
import { UpdateUserBodyPipe } from '../pipes/update-user-body.pipe'

@Controller('users')
@ApiTags('Users')
@ApiExtraModels(UpdateUserDto)
export class UpdateUserController {
  constructor(@Inject(UpdateUserUseCase) private readonly useCase: UpdateUserUseCase) {}

  @Patch(':userId')
  @ApiOperation({ operationId: 'updateUser', summary: 'Actualizar usuario' })
  @ApiParam({ name: 'userId', required: true, description: 'ID del usuario', type: String })
  @ApiBody({ schema: { allOf: [{ $ref: getSchemaPath(UpdateUserDto) }], minProperties: 1 } })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UpdateUserResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(
    @Param('userId') userId: string,
    @Body(new UpdateUserBodyPipe()) dto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    try {
      return await this.useCase.execute(userId, dto)
    } catch (error) {
      UserErrorTranslator.translate(error, `/users/${userId}`)
      throw error
    }
  }
}
