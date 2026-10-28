import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'

import { CurrentUser } from '@nestjs/authentication'

import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateUserUseCase, type CreateUserActor } from '../../../application/use-cases/create-user.use-case'

import { CreateUserDto } from '../../../application/dtos/create-user.dto'
import { CreateUserResponseDto } from '../../../application/dtos/create-user-response.dto'

import { UserErrorTranslator } from '../errors/user-error.translator'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class CreateUserController {
  constructor(private readonly useCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un usuario',
    description: 'Crea un usuario según los permisos del usuario autenticado.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    type: CreateUserResponseDto,
  })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreateUserDto, @CurrentUser() actor: CreateUserActor): Promise<CreateUserResponseDto> {
    try {
      return await this.useCase.execute(dto, actor)
    } catch (error) {
      UserErrorTranslator.translate(error, '/users')
      throw error
    }
  }
}
