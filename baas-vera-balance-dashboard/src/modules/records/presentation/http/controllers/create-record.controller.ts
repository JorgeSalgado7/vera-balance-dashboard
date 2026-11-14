import { Controller, HttpCode, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { CreateRecordUseCase } from '../../../application/use-cases/create-record.use-case'
import { CreateRecordResponseDto } from '../../../application/dtos/create-record-response.dto'
import { RecordErrorTranslator } from '../errors/record-error.translator'
import { CreateRecordDto } from '../../../application/dtos/create-record.dto'

@Controller('records')
@ApiTags('Records')
export class CreateRecordController {
  constructor(private readonly useCase: CreateRecordUseCase) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({ operationId: 'createRecord', summary: 'Crear registro de sesión' })
  @ApiBody({ type: CreateRecordDto })
  @ApiResponse({ status: 201, type: CreateRecordResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreateRecordDto): Promise<CreateRecordResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      RecordErrorTranslator.translate(error, `/records`)
      throw error
    }
  }
}
