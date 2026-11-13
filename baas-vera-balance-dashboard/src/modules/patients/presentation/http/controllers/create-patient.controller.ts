import { Controller, HttpCode, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { CreatePatientUseCase } from '../../../application/use-cases/create-patient.use-case'
import { CreatePatientResponseDto } from '../../../application/dtos/create-patient-response.dto'
import { PatientErrorTranslator } from '../errors/patient-error.translator'
import { CreatePatientDto } from '../../../application/dtos/create-patient.dto'

@Controller('patients')
@ApiTags('Patients')
export class CreatePatientController {
  constructor(private readonly useCase: CreatePatientUseCase) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({ operationId: 'createPatient', summary: 'Crear paciente' })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({ status: 201, type: CreatePatientResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreatePatientDto): Promise<CreatePatientResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      PatientErrorTranslator.translate(error, `/patients`)
      throw error
    }
  }
}
