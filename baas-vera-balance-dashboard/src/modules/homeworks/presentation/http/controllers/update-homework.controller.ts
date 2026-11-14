import { Controller, HttpCode, Patch, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger'
import { UpdateHomeworkUseCase } from '../../../application/use-cases/update-homework.use-case'
import { UpdateHomeworkResponseDto } from '../../../application/dtos/update-homework-response.dto'
import { HomeworkErrorTranslator } from '../errors/homework-error.translator'
import { UpdateHomeworkDto } from '../../../application/dtos/update-homework.dto'

@Controller('homeworks')
@ApiTags('HomeWorks')
export class UpdateHomeworkController {
  constructor(private readonly useCase: UpdateHomeworkUseCase) {}

  @Patch(':homeworkId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateHomework', summary: 'Actualizar tarea' })
  @ApiParam({ name: 'homeworkId', type: String })
  @ApiBody({ type: UpdateHomeworkDto })
  @ApiResponse({ status: 200, type: UpdateHomeworkResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('homeworkId') homeworkId: string, @Body() dto: UpdateHomeworkDto): Promise<UpdateHomeworkResponseDto> {
    try {
      return await this.useCase.execute(homeworkId, dto)
    } catch (error) {
      HomeworkErrorTranslator.translate(error, `/homeworks/${homeworkId}`)
      throw error
    }
  }
}
