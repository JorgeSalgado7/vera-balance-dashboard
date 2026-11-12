import { Controller, Inject, Get, HttpCode } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetTherapyTypesUseCase } from '../../../application/use-cases/get-therapy-types.use-case'
import { GetTherapyTypesResponseDto } from '../../../application/dtos/get-therapy-types-response.dto'
import { TherapyTypeErrorTranslator } from '../errors/therapy-type-error.translator'

@Controller('therapy-types')
@ApiTags('Therapy Types')
export class GetTherapyTypesController {
  constructor(@Inject(GetTherapyTypesUseCase) private readonly useCase: GetTherapyTypesUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getTherapyTypes', summary: 'Obtener tipos de terapia' })
  @ApiResponse({ status: 200, type: GetTherapyTypesResponseDto, isArray: true })
  @ApiResponse({ status: 500 })
  async execute(): Promise<GetTherapyTypesResponseDto[]> {
    try {
      return await this.useCase.execute()
    } catch (error) {
      TherapyTypeErrorTranslator.translate(error, '/therapy-types')
      throw error
    }
  }
}
