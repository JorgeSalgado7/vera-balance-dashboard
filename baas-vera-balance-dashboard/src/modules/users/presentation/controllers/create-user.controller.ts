import { Body, Controller, HttpCode, HttpStatus, Post, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';

@Controller('users')
@ApiTags('Users')
export class CreateUserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase
  ) {}

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  execute(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }
}
