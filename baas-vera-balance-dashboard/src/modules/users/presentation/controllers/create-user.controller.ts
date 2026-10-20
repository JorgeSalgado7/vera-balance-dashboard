import { Controller, Post, HttpCode, Version, Body, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import type { AuthenticatedUserContext } from '../../application/dtos/authenticated-user-context.dto';
import { AuthenticatedUser } from '../decorators/authenticated-user.decorator';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { CsrfGuard } from '../../../../shared/http-security/csrf.guard';

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth('vera_balance_session')
export class CreateUserController {
  constructor(private readonly useCase: CreateUserUseCase) {}

  @Version('1')
  @Post()
  @HttpCode(201)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  execute(@AuthenticatedUser() actor: AuthenticatedUserContext, @Body() dto: CreateUserDto) {
    return this.useCase.execute(actor, dto);
  }
}
