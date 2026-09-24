import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Version
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';

@Controller('users')
@ApiTags('Users')
export class DeleteUserController {
  constructor(
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  @Version('1')
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user'
  })
  @ApiResponse({
    status: 204
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async execute(@Param('id') userId: string): Promise<void> {
    await this.deleteUserUseCase.execute(userId);
  }
}
