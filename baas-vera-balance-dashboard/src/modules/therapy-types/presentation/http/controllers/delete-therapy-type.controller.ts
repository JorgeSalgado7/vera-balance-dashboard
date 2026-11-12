import { Controller, Inject, Delete, HttpCode, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger'
import { DeleteTherapyTypeUseCase } from '../../../application/use-cases/delete-therapy-type.use-case'
import { TherapyTypeErrorTranslator } from '../errors/therapy-type-error.translator'

@Controller('therapy-types')
@ApiTags('Therapy Types')
export class DeleteTherapyTypeController {
  constructor(@Inject(DeleteTherapyTypeUseCase) private readonly useCase: DeleteTherapyTypeUseCase) {}

  @Delete(':therapyTypeId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteTherapyType', summary: 'Eliminar tipo de terapia' })
  @ApiParam({ name: 'therapyTypeId', type: String })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('therapyTypeId') id: string): Promise<void> {
    try {
      await this.useCase.execute(id)
    } catch (error) {
      TherapyTypeErrorTranslator.translate(error, `/therapy-types/${id}`)
      throw error
    }
  }
}
