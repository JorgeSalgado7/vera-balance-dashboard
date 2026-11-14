import { Controller, HttpCode, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetHomeworkByIdUseCase } from '../../../application/use-cases/get-homework-by-id.use-case'
import { GetHomeworkByIdResponseDto } from '../../../application/dtos/get-homework-by-id-response.dto'
import { HomeworkErrorTranslator } from '../errors/homework-error.translator'

@Controller('homeworks')
@ApiTags('HomeWorks')
export class GetHomeworkByIdController {
  constructor(private readonly useCase: GetHomeworkByIdUseCase) {}

  @Get(':homeworkId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getHomework', summary: 'Obtener tarea por ID' })
  @ApiParam({ name: 'homeworkId', type: String })
  @ApiResponse({ status: 200, type: GetHomeworkByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('homeworkId') homeworkId: string): Promise<GetHomeworkByIdResponseDto> {
    try {
      return await this.useCase.execute(homeworkId)
    } catch (error) {
      HomeworkErrorTranslator.translate(error, `/homeworks/${homeworkId}`)
      throw error
    }
  }
}
