import { Controller, Delete, HttpCode, Version, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import { CsrfGuard } from '../../../../shared/http-security/csrf.guard';

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth('vera_balance_session')
export class DeleteUserController {
  constructor(private readonly useCase: DeleteUserUseCase) {}

  @Version('1')
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Delete User' })
  @ApiResponse({ status: 204 })
  execute(@AuthenticatedUser() actor: AuthenticatedUserContext, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.useCase.execute(actor, id);
  }
}
