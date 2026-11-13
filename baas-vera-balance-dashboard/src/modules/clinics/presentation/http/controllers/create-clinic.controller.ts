import { Controller, HttpCode, Body, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { CreateClinicUseCase } from '../../../application/use-cases/create-clinic.use-case'
import { CreateClinicDto } from '../../../application/dtos/create-clinic.dto'
import { CreateClinicResponseDto } from '../../../application/dtos/create-clinic-response.dto'
import { ClinicErrorTranslator } from '../errors/clinic-error.translator'

@Controller('clinics')
@ApiTags('Clinics')
export class CreateClinicController {
  constructor(private readonly useCase: CreateClinicUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createClinic', summary: 'Crear clínica' })
  @ApiBody({ type: CreateClinicDto })
  @ApiResponse({ status: 201, type: CreateClinicResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreateClinicDto): Promise<CreateClinicResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      ClinicErrorTranslator.translate(error, '/clinics', 'create')
      throw error
    }
  }
}
