import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetRecordByIdUseCase } from '../../../application/use-cases/get-record-by-id.use-case'
import { GetRecordByIdResponseDto } from '../../../application/dtos/get-record-by-id-response.dto'
import { RecordErrorTranslator } from '../errors/record-error.translator'

@Controller('records')
@ApiTags('Records')
export class GetRecordByIdController {
  constructor(private readonly useCase: GetRecordByIdUseCase) {}

  @Get(':recordId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getRecord', summary: 'Obtener registro por ID' })
  @ApiParam({ name: 'recordId', type: String })
  @ApiResponse({ status: 200, type: GetRecordByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('recordId') recordId: string): Promise<GetRecordByIdResponseDto> {
    try {
      return await this.useCase.execute(recordId)
    } catch (error) {
      RecordErrorTranslator.translate(error, `/records/${recordId}`)
      throw error
    }
  }
}
