import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetRecordHomeworksUseCase } from '../../../application/use-cases/get-record-homeworks.use-case'
import { GetRecordHomeworksResponseDto } from '../../../application/dtos/get-record-homeworks-response.dto'
import { HomeworkErrorTranslator } from '../errors/homework-error.translator'

@Controller('homeworks')
@ApiTags('HomeWorks')
export class GetRecordHomeworksController {
  constructor(private readonly useCase: GetRecordHomeworksUseCase) {}

  @Get('records/:recordId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getRecordHomeworks', summary: 'Obtener tareas de un registro' })
  @ApiParam({ name: 'recordId', type: String })
  @ApiResponse({ status: 200, type: GetRecordHomeworksResponseDto, isArray: true })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('recordId') recordId: string): Promise<GetRecordHomeworksResponseDto[]> {
    try {
      return await this.useCase.execute(recordId)
    } catch (error) {
      HomeworkErrorTranslator.translate(error, `/homeworks/records/${recordId}`)
      throw error
    }
  }
}
