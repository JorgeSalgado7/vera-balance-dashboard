import { Controller, Inject, Get, HttpCode, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger'
import { GetTherapyTypeByIdUseCase } from '../../../application/use-cases/get-therapy-type-by-id.use-case'
import { GetTherapyTypeByIdResponseDto } from '../../../application/dtos/get-therapy-type-by-id-response.dto'
import { TherapyTypeErrorTranslator } from '../errors/therapy-type-error.translator'

@Controller('therapy-types')
@ApiTags('Therapy Types')
export class GetTherapyTypeByIdController {
  constructor(@Inject(GetTherapyTypeByIdUseCase) private readonly useCase: GetTherapyTypeByIdUseCase) {}

  @Get(':therapyTypeId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getTherapyType', summary: 'Obtener tipo de terapia por ID' })
  @ApiParam({ name: 'therapyTypeId', type: String })
  @ApiResponse({ status: 200, type: GetTherapyTypeByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('therapyTypeId') id: string): Promise<GetTherapyTypeByIdResponseDto> {
    try {
      return await this.useCase.execute(id)
    } catch (error) {
      TherapyTypeErrorTranslator.translate(error, `/therapy-types/${id}`)
      throw error
    }
  }
}
