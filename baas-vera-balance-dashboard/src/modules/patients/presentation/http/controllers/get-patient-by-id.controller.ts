import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetPatientByIdUseCase } from '../../../application/use-cases/get-patient-by-id.use-case'
import { GetPatientByIdResponseDto } from '../../../application/dtos/get-patient-by-id-response.dto'
import { PatientErrorTranslator } from '../errors/patient-error.translator'

@Controller('patients')
@ApiTags('Patients')
export class GetPatientByIdController {
  constructor(private readonly useCase: GetPatientByIdUseCase) {}

  @Get(':patientId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getPatient', summary: 'Obtener paciente por ID' })
  @ApiParam({ name: 'patientId', type: String })
  @ApiResponse({ status: 200, type: GetPatientByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('patientId') patientId: string): Promise<GetPatientByIdResponseDto> {
    try {
      return await this.useCase.execute(patientId)
    } catch (error) {
      PatientErrorTranslator.translate(error, `/patients/${patientId}`)
      throw error
    }
  }
}
