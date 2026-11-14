import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetPatientTherapeuticProcessesUseCase } from '../../../application/use-cases/get-patient-therapeutic-processes.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'
import { GetPatientTherapeuticProcessesResponseDto } from '../../../application/dtos/get-patient-therapeutic-processes-response.dto'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
export class GetPatientTherapeuticProcessesController {
  constructor(private readonly useCase: GetPatientTherapeuticProcessesUseCase) {}

  @Get('patients/:patientId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getPatientTherapeuticProcesses', summary: 'Obtener procesos de un paciente' })
  @ApiParam({ name: 'patientId', type: String })
  @ApiResponse({ status: 200, type: GetPatientTherapeuticProcessesResponseDto, isArray: true })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('patientId') patientId: string): Promise<GetPatientTherapeuticProcessesResponseDto[]> {
    try {
      return await this.useCase.execute(patientId)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes/patients/${patientId}`, 'read')
      throw error
    }
  }
}
