import { Controller, HttpCode, Patch, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger'
import { UpdateRecordUseCase } from '../../../application/use-cases/update-record.use-case'
import { UpdateRecordResponseDto } from '../../../application/dtos/update-record-response.dto'
import { RecordErrorTranslator } from '../errors/record-error.translator'
import { UpdateRecordDto } from '../../../application/dtos/update-record.dto'

@Controller('records')
@ApiTags('Records')
export class UpdateRecordController {
  constructor(private readonly useCase: UpdateRecordUseCase) {}

  @Patch(':recordId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateRecord', summary: 'Actualizar registro' })
  @ApiParam({ name: 'recordId', type: String })
  @ApiBody({ type: UpdateRecordDto })
  @ApiResponse({ status: 200, type: UpdateRecordResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('recordId') recordId: string, @Body() dto: UpdateRecordDto): Promise<UpdateRecordResponseDto> {
    try {
      return await this.useCase.execute(recordId, dto)
    } catch (error) {
      RecordErrorTranslator.translate(error, `/records/${recordId}`)
      throw error
    }
  }
}
