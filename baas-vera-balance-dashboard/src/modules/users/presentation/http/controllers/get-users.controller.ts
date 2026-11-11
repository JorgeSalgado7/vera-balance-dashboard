import { Controller, Get, Inject } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case'
import { GetUsersResponseDto } from '../../../application/dtos/get-users-response.dto'
import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
export class GetUsersController {
  constructor(@Inject(GetUsersUseCase) private readonly useCase: GetUsersUseCase) {}

  @Get()
  @ApiOperation({ operationId: 'getUsers', summary: 'Obtener usuarios', description: 'Consulta global mediante GSI1 (gsi1pk = USER).' })
  @ApiResponse({ status: 200, description: 'Usuarios encontrados', type: GetUsersResponseDto, isArray: true })
  @ApiResponse({ status: 500 })
  async execute(): Promise<GetUsersResponseDto[]> {
    try {
      return await this.useCase.execute()
    } catch (error) {
      UserErrorTranslator.translate(error, '/users')
      throw error
    }
  }
}
