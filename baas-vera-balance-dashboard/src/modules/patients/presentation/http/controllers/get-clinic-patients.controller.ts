import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetClinicPatientsUseCase } from '../../../application/use-cases/get-clinic-patients.use-case'
import { GetClinicPatientsResponseDto } from '../../../application/dtos/get-clinic-patients-response.dto'
import { PatientErrorTranslator } from '../errors/patient-error.translator'

@Controller('patients')
@ApiTags('Patients')
export class GetClinicPatientsController {
  constructor(private readonly useCase: GetClinicPatientsUseCase) {}

  @Get('clinics/:clinicId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getClinicPatients', summary: 'Obtener pacientes de una clínica' })
  @ApiParam({ name: 'clinicId', type: String })
  @ApiResponse({ status: 200, type: GetClinicPatientsResponseDto, isArray: true })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('clinicId') clinicId: string): Promise<GetClinicPatientsResponseDto[]> {
    try {
      return await this.useCase.execute(clinicId)
    } catch (error) {
      PatientErrorTranslator.translate(error, `/patients/clinics/${clinicId}`)
      throw error
    }
  }
}
