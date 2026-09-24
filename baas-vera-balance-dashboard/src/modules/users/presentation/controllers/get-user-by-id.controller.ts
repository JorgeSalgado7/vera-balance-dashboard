import {
  Controller,
  Get,
  Param,
  Version
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@ApiTags('Users')
export class GetUserByIdController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase
  ) {}

  @Version('1')
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id'
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto
  })
  execute(@Param('id') userId: string) {
    return this.getUserByIdUseCase.execute(userId);
  }
}
