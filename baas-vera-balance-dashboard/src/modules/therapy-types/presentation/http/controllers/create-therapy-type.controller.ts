import { Controller, Inject, Post, HttpCode, Body } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger'
import { CreateTherapyTypeUseCase } from '../../../application/use-cases/create-therapy-type.use-case'
import { CreateTherapyTypeDto } from '../../../application/dtos/create-therapy-type.dto'
import { CreateTherapyTypeResponseDto } from '../../../application/dtos/create-therapy-type-response.dto'
import { TherapyTypeErrorTranslator } from '../errors/therapy-type-error.translator'

@Controller('therapy-types')
@ApiTags('Therapy Types')
export class CreateTherapyTypeController {
  constructor(@Inject(CreateTherapyTypeUseCase) private readonly useCase: CreateTherapyTypeUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createTherapyType', summary: 'Crear tipo de terapia' })
  @ApiBody({ type: CreateTherapyTypeDto })
  @ApiResponse({ status: 201, type: CreateTherapyTypeResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Body() dto: CreateTherapyTypeDto): Promise<CreateTherapyTypeResponseDto> {
    try {
      return await this.useCase.execute(dto)
    } catch (error) {
      TherapyTypeErrorTranslator.translate(error, '/therapy-types')
      throw error
    }
  }
}
