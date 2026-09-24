import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Version
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { UpdateUserStatusUseCase } from '../../application/use-cases/update-user-status.use-case';
import { UpdateUserStatusDto } from '../../application/dtos/update-user-status.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@ApiTags('Users')
export class UpdateUserStatusController {
  constructor(
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase
  ) {}

  @Version('1')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update user status'
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto
  })
  @HttpCode(HttpStatus.OK)
  execute(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto
  ) {
    return this.updateUserStatusUseCase.execute(userId, dto);
  }
}
