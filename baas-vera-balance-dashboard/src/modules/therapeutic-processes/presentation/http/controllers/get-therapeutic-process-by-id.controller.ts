import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetTherapeuticProcessByIdUseCase } from '../../../application/use-cases/get-therapeutic-process-by-id.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'
import { GetTherapeuticProcessByIdResponseDto } from '../../../application/dtos/get-therapeutic-process-by-id-response.dto'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
export class GetTherapeuticProcessByIdController {
  constructor(private readonly useCase: GetTherapeuticProcessByIdUseCase) {}

  @Get(':processId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getTherapeuticProcess', summary: 'Obtener proceso terapéutico por ID' })
  @ApiParam({ name: 'processId', type: String })
  @ApiResponse({ status: 200, type: GetTherapeuticProcessByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('processId') processId: string): Promise<GetTherapeuticProcessByIdResponseDto> {
    try {
      return await this.useCase.execute(processId)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes/${processId}`, 'read')
      throw error
    }
  }
}
