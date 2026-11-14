import { Controller, HttpCode, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { CreateHomeworkUseCase } from '../../../application/use-cases/create-homework.use-case'
import { CreateHomeworkResponseDto } from '../../../application/dtos/create-homework-response.dto'
import { HomeworkErrorTranslator } from '../errors/homework-error.translator'
import { CreateHomeworkDto } from '../../../application/dtos/create-homework.dto'

@Controller('homeworks')
@ApiTags('HomeWorks')
export class CreateHomeworkController {
  constructor(private readonly useCase: CreateHomeworkUseCase) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({ operationId: 'createHomework', summary: 'Crear tarea' })
  @ApiBody({ type: CreateHomeworkDto })
  @ApiResponse({ status: 201, type: CreateHomeworkResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreateHomeworkDto): Promise<CreateHomeworkResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      HomeworkErrorTranslator.translate(error, `/homeworks`)
      throw error
    }
  }
}
