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
import { GetClinicByIdUseCase } from '../../application/use-cases/get-clinic-by-id.use-case';
import { ClinicResponseDto } from '../../application/dtos/clinic-response.dto';

@Controller('clinics')
@ApiTags('Clinics')
export class GetClinicByIdController {
  constructor(
    private readonly getClinicByIdUseCase: GetClinicByIdUseCase
  ) {}

  @Version('1')
  @Get(':id')
  @ApiOperation({
    summary: 'Get clinic by id'
  })
  @ApiResponse({
    status: 200,
    type: ClinicResponseDto
  })
  execute(@Param('id') clinicId: string) {
    return this.getClinicByIdUseCase.execute(clinicId);
  }
}