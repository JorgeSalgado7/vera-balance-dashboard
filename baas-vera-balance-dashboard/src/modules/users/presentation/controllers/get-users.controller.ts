import { Controller, Get, HttpCode, Version } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth('vera_balance_session')
export class GetUsersController {
  constructor(private readonly useCase: GetUsersUseCase) {}

  @Version('1')
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Users' })
  @ApiResponse({ status: 200, type: UserResponseDto, isArray: true })
  execute(@AuthenticatedUser() actor: AuthenticatedUserContext) {
    return this.useCase.execute(actor);
  }
}
