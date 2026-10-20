import { Controller, Patch, HttpCode, Version, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeUserStatusUseCase } from '../../application/use-cases/change-user-status.use-case';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { ChangeUserStatusDto } from '../../application/dtos/change-user-status.dto';
import { CsrfGuard } from '../../../../shared/http-security/csrf.guard';

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth('vera_balance_session')
export class ChangeUserStatusController {
  constructor(private readonly useCase: ChangeUserStatusUseCase) {}

  @Version('1')
  @Patch(':id/status')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Change User Status' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  execute(@AuthenticatedUser() actor: AuthenticatedUserContext, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ChangeUserStatusDto) {
    return this.useCase.execute(actor, id, dto.status);
  }
}
