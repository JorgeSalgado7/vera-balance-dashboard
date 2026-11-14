import { Controller, HttpCode, Patch, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'
import { UpdateTherapeuticProcessUseCase } from '../../../application/use-cases/update-therapeutic-process.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'
import { UpdateTherapeuticProcessResponseDto } from '../../../application/dtos/update-therapeutic-process-response.dto'
import { UpdateTherapeuticProcessDto } from '../../../application/dtos/update-therapeutic-process.dto'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
@ApiExtraModels(UpdateTherapeuticProcessDto)
export class UpdateTherapeuticProcessController {
  constructor(private readonly useCase: UpdateTherapeuticProcessUseCase) {}

  @Patch(':processId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateTherapeuticProcess', summary: 'Actualizar proceso terapéutico' })
  @ApiParam({ name: 'processId', type: String })
  @ApiBody({ schema: { allOf: [{ $ref: getSchemaPath(UpdateTherapeuticProcessDto) }], minProperties: 1 } })
  @ApiResponse({ status: 200, type: UpdateTherapeuticProcessResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('processId') processId: string, @Body() dto: UpdateTherapeuticProcessDto): Promise<UpdateTherapeuticProcessResponseDto> {
    try {
      return await this.useCase.execute(processId, dto)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes/${processId}`, 'write')
      throw error
    }
  }
}
