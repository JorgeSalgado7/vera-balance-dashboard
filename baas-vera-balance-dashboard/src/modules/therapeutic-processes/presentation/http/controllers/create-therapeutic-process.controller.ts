import { Controller, HttpCode, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { CreateTherapeuticProcessUseCase } from '../../../application/use-cases/create-therapeutic-process.use-case'
import { TherapeuticProcessErrorTranslator } from '../errors/therapeutic-process-error.translator'
import { CreateTherapeuticProcessResponseDto } from '../../../application/dtos/create-therapeutic-process-response.dto'
import { CreateTherapeuticProcessDto } from '../../../application/dtos/create-therapeutic-process.dto'

@Controller('therapeutic-processes')
@ApiTags('Therapeutic Processes')
export class CreateTherapeuticProcessController {
  constructor(private readonly useCase: CreateTherapeuticProcessUseCase) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({ operationId: 'createTherapeuticProcess', summary: 'Crear proceso terapéutico' })
  @ApiBody({ type: CreateTherapeuticProcessDto })
  @ApiResponse({ status: 201, type: CreateTherapeuticProcessResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreateTherapeuticProcessDto): Promise<CreateTherapeuticProcessResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      TherapeuticProcessErrorTranslator.translate(error, `/therapeutic-processes`, 'write')
      throw error
    }
  }
}
