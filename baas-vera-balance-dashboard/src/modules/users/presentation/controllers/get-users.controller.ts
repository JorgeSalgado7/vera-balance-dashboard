import { Controller, Get, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@ApiTags('Users')
export class GetUsersController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get users' })
  @ApiResponse({ status: 200, type: UserResponseDto, isArray: true })
  execute(): Promise<UserResponseDto[]> {
    return this.getUsersUseCase.execute();
  }
}
