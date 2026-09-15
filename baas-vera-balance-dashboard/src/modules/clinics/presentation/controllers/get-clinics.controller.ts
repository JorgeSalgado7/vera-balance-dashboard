import {
  Controller,
  Get,
  Version
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { GetClinicsUseCase } from '../../application/use-cases/get-clinics.use-case';
import { ClinicResponseDto } from '../../application/dtos/clinic-response.dto';

@Controller('clinics')
@ApiTags('Clinics')
export class GetClinicsController {
  constructor(
    private readonly getClinicsUseCase: GetClinicsUseCase
  ) {}

  @Version('1')
  @Get()
  @ApiOperation({
    summary: 'Get clinics'
  })
  @ApiResponse({
    status: 200,
    type: ClinicResponseDto,
    isArray: true
  })
  execute() {
    return this.getClinicsUseCase.execute();
  }
}