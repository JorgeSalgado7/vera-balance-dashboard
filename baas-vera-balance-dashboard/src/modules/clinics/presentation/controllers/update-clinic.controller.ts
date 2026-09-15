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
import { UpdateClinicUseCase } from '../../application/use-cases/update-clinic.use-case';
import { UpdateClinicDto } from '../../application/dtos/update-clinic.dto';
import { ClinicResponseDto } from '../../application/dtos/clinic-response.dto';

@Controller('clinics')
@ApiTags('Clinics')
export class UpdateClinicController {
  constructor(
    private readonly updateClinicUseCase: UpdateClinicUseCase
  ) {}

  @Version('1')
  @Put(':id')
  @ApiOperation({
    summary: 'Update clinic'
  })
  @ApiResponse({
    status: 200,
    type: ClinicResponseDto
  })
  @HttpCode(HttpStatus.OK)
  execute(
    @Param('id') clinicId: string,
    @Body() dto: UpdateClinicDto
  ) {
    return this.updateClinicUseCase.execute(clinicId, dto);
  }
}