import { Controller, HttpCode, Patch, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'
import { UpdatePatientUseCase } from '../../../application/use-cases/update-patient.use-case'
import { UpdatePatientResponseDto } from '../../../application/dtos/update-patient-response.dto'
import { PatientErrorTranslator } from '../errors/patient-error.translator'
import { UpdatePatientDto } from '../../../application/dtos/update-patient.dto'

@Controller('patients')
@ApiTags('Patients')
@ApiExtraModels(UpdatePatientDto)
export class UpdatePatientController {
  constructor(private readonly useCase: UpdatePatientUseCase) {}

  @Patch(':patientId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updatePatient', summary: 'Actualizar paciente' })
  @ApiParam({ name: 'patientId', type: String })
  @ApiBody({ schema: { allOf: [{ $ref: getSchemaPath(UpdatePatientDto) }], minProperties: 1 } })
  @ApiResponse({ status: 200, type: UpdatePatientResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('patientId') patientId: string, @Body() dto: UpdatePatientDto): Promise<UpdatePatientResponseDto> {
    try {
      return await this.useCase.execute(patientId, dto)
    } catch (error) {
      PatientErrorTranslator.translate(error, `/patients/${patientId}`)
      throw error
    }
  }
}
