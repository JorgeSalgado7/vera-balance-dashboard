import { Controller, HttpCode, Delete, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { DeleteTherapeuticProcessUseCase } from '../../../application/use-cases/delete-therapeutic-process.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
export class DeleteTherapeuticProcessController {
  constructor(private readonly useCase: DeleteTherapeuticProcessUseCase) {}

  @Delete(':processId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteTherapeuticProcess', summary: 'Eliminar proceso terapéutico' })
  @ApiParam({ name: 'processId', type: String })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('processId') processId: string): Promise<void> {
    try {
      await this.useCase.execute(processId)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes/${processId}`, 'write')
      throw error
    }
  }
}
