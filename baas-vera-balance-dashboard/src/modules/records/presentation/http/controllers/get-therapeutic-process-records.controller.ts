import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetTherapeuticProcessRecordsUseCase } from '../../../application/use-cases/get-therapeutic-process-records.use-case'
import { GetTherapeuticProcessRecordsResponseDto } from '../../../application/dtos/get-therapeutic-process-records-response.dto'
import { RecordErrorTranslator } from '../errors/record-error.translator'

@Controller('records')
@ApiTags('Records')
export class GetTherapeuticProcessRecordsController {
  constructor(private readonly useCase: GetTherapeuticProcessRecordsUseCase) {}

  @Get('therapeutic-processes/:processId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getTherapeuticProcessRecords', summary: 'Obtener registros de un proceso' })
  @ApiParam({ name: 'processId', type: String })
  @ApiResponse({ status: 200, type: GetTherapeuticProcessRecordsResponseDto, isArray: true })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('processId') processId: string): Promise<GetTherapeuticProcessRecordsResponseDto[]> {
    try {
      return await this.useCase.execute(processId)
    } catch (error) {
      RecordErrorTranslator.translate(error, `/records/therapeutic-processes/${processId}`)
      throw error
    }
  }
}
