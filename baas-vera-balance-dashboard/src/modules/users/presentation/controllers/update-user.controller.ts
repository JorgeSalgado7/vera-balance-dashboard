import { Controller, Put, HttpCode, Version, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { CsrfGuard } from '../../../../shared/http-security/csrf.guard';

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth('vera_balance_session')
export class UpdateUserController {
  constructor(private readonly useCase: UpdateUserUseCase) {}

  @Version('1')
  @Put(':id')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  execute(@AuthenticatedUser() actor: AuthenticatedUserContext, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateUserDto) {
    return this.useCase.execute(actor, id, dto);
  }
}
