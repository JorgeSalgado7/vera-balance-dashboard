import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetClinicTherapeuticProcessesUseCase } from '../../../application/use-cases/get-clinic-therapeutic-processes.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'
import { GetClinicTherapeuticProcessesResponseDto } from '../../../application/dtos/get-clinic-therapeutic-processes-response.dto'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
export class GetClinicTherapeuticProcessesController {
  constructor(private readonly useCase: GetClinicTherapeuticProcessesUseCase) {}

  @Get('clinics/:clinicId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getClinicTherapeuticProcesses', summary: 'Obtener procesos de una clínica' })
  @ApiParam({ name: 'clinicId', type: String })
  @ApiResponse({ status: 200, type: GetClinicTherapeuticProcessesResponseDto, isArray: true })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('clinicId') clinicId: string): Promise<GetClinicTherapeuticProcessesResponseDto[]> {
    try {
      return await this.useCase.execute(clinicId)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes/clinics/${clinicId}`, 'read')
      throw error
    }
  }
}
