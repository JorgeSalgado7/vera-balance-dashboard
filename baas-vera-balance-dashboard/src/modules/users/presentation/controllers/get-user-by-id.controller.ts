import { Controller, Get, HttpCode, Version, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth('vera_balance_session')
export class GetUserByIdController {
  constructor(private readonly useCase: GetUserByIdUseCase) {}

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get User By Id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  execute(@AuthenticatedUser() actor: AuthenticatedUserContext, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.useCase.execute(actor, id);
  }
}
