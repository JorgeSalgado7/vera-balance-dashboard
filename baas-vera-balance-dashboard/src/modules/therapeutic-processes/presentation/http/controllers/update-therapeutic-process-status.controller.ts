import { Controller, HttpCode, Patch, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger'
import { UpdateTherapeuticProcessStatusUseCase } from '../../../application/use-cases/update-therapeutic-process-status.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'
import { UpdateTherapeuticProcessStatusResponseDto } from '../../../application/dtos/update-therapeutic-process-status-response.dto'
import { UpdateTherapeuticProcessStatusDto } from '../../../application/dtos/update-therapeutic-process-status.dto'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
export class UpdateTherapeuticProcessStatusController {
  constructor(private readonly useCase: UpdateTherapeuticProcessStatusUseCase) {}

  @Patch(':processId/status')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateTherapeuticProcessStatus', summary: 'Actualizar estatus del proceso' })
  @ApiParam({ name: 'processId', type: String })
  @ApiBody({ type: UpdateTherapeuticProcessStatusDto })
  @ApiResponse({ status: 200, type: UpdateTherapeuticProcessStatusResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('processId') processId: string, @Body() dto: UpdateTherapeuticProcessStatusDto): Promise<UpdateTherapeuticProcessStatusResponseDto> {
    try {
      return await this.useCase.execute(processId, dto)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes/${processId}/status`, 'write')
      throw error
    }
  }
}
