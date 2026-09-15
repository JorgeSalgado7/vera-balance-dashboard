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
import { DeleteClinicUseCase } from '../../application/use-cases/delete-clinic.use-case';

@Controller('clinics')
@ApiTags('Clinics')
export class DeleteClinicController {
  constructor(
    private readonly deleteClinicUseCase: DeleteClinicUseCase
  ) {}

  @Version('1')
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete clinic'
  })
  @ApiResponse({
    status: 204
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async execute(@Param('id') clinicId: string): Promise<void> {
    await this.deleteClinicUseCase.execute(clinicId);
  }
}