import { Body, Controller, HttpCode, HttpStatus, Post, Version } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { CreateClinicUseCase } from '../../application/use-cases/create-clinic.use-case';
import { CreateClinicDto } from '../../application/dtos/create-clinic.dto';
import { ClinicResponseDto } from '../../application/dtos/clinic-response.dto';

@Controller('clinics')
@ApiTags('Clinics')
export class CreateClinicController {
  constructor(
    private readonly createClinicUseCase: CreateClinicUseCase
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({
    summary: 'Create clinic'
  })
  @ApiResponse({
    status: 201,
    type: ClinicResponseDto
  })
  @HttpCode(HttpStatus.CREATED)
  execute(@Body() dto: CreateClinicDto) {
    return this.createClinicUseCase.execute(dto);
  }
}