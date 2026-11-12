import { Controller, Inject, Patch, HttpCode, Body, Param } from '@nestjs/common'
import { ApiExtraModels, getSchemaPath, ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger'
import { UpdateTherapyTypeUseCase } from '../../../application/use-cases/update-therapy-type.use-case'
import { UpdateTherapyTypeDto } from '../../../application/dtos/update-therapy-type.dto'
import { UpdateTherapyTypeResponseDto } from '../../../application/dtos/update-therapy-type-response.dto'
import { TherapyTypeErrorTranslator } from '../errors/therapy-type-error.translator'

@Controller('therapy-types')
@ApiTags('Therapy Types')
@ApiExtraModels(UpdateTherapyTypeDto)
export class UpdateTherapyTypeController {
  constructor(@Inject(UpdateTherapyTypeUseCase) private readonly useCase: UpdateTherapyTypeUseCase) {}

  @Patch(':therapyTypeId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateTherapyType', summary: 'Actualizar tipo de terapia' })
  @ApiParam({ name: 'therapyTypeId', type: String })
  @ApiBody({ schema: { allOf: [{ $ref: getSchemaPath(UpdateTherapyTypeDto) }], minProperties: 1 } })
  @ApiResponse({ status: 200, type: UpdateTherapyTypeResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('therapyTypeId') id: string, @Body() dto: UpdateTherapyTypeDto): Promise<UpdateTherapyTypeResponseDto> {
    try {
      return await this.useCase.execute(id, dto)
    } catch (error) {
      TherapyTypeErrorTranslator.translate(error, `/therapy-types/${id}`)
      throw error
    }
  }
}
