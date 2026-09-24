import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Version
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@ApiTags('Users')
export class UpdateUserController {
  constructor(
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  @Version('1')
  @Put(':id')
  @ApiOperation({
    summary: 'Update user'
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto
  })
  @HttpCode(HttpStatus.OK)
  execute(
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.updateUserUseCase.execute(userId, dto);
  }
}
