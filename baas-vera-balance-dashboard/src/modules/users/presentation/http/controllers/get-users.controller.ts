import { Controller, Get, Inject } from '@nestjs/common'
import { CurrentUser } from '@nestjs/authentication'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetUsersUseCase, type GetUsersActor } from '../../../application/use-cases/get-users.use-case'
import { GetUsersResponseDto } from '../../../application/dtos/get-users-response.dto'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
export class GetUsersController {
  constructor(@Inject(GetUsersUseCase) private readonly useCase: GetUsersUseCase) {}

  @Get()
  @ApiOperation({ operationId: 'getUsers', summary: 'Obtener usuarios', description: 'Acceso exclusivo de admin. Consulta global mediante GSI1 (gsi1pk = USER).' })
  @ApiResponse({ status: 200, description: 'Usuarios encontrados', type: GetUsersResponseDto, isArray: true })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 500 })
  async execute(@CurrentUser() actor: GetUsersActor): Promise<GetUsersResponseDto[]> {
    try {
      return await this.useCase.execute(actor)
    } catch (error) {
      UserErrorTranslator.translate(error, '/users')
      throw error
    }
  }
}
