import { Controller, HttpCode, Body, Param, Patch } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'
import { UpdateClinicUseCase } from '../../../application/use-cases/update-clinic.use-case'
import { UpdateClinicDto } from '../../../application/dtos/update-clinic.dto'
import { UpdateClinicResponseDto } from '../../../application/dtos/update-clinic-response.dto'
import { ClinicErrorTranslator } from '../errors/clinic-error.translator'

@Controller('clinics')
@ApiTags('Clinics')
@ApiExtraModels(UpdateClinicDto)
export class UpdateClinicController {
  constructor(private readonly useCase: UpdateClinicUseCase) {}

  @Patch(':clinicId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateClinic', summary: 'Actualizar clínica' })
  @ApiParam({ name: 'clinicId', type: String })
  @ApiBody({ schema: { allOf: [{ $ref: getSchemaPath(UpdateClinicDto) }], minProperties: 1 } })
  @ApiResponse({ status: 200, type: UpdateClinicResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  @ApiResponse({ status: 500 })
  async execute(@Param('clinicId') clinicId: string, @Body() dto: UpdateClinicDto): Promise<UpdateClinicResponseDto> {
    try {
      return await this.useCase.execute(clinicId, dto)
    } catch (error) {
      ClinicErrorTranslator.translate(error, `/clinics/${clinicId}`, 'update')
      throw error
    }
  }
}
