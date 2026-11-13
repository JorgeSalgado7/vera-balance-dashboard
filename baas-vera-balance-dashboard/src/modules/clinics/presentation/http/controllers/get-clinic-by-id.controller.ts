import { Controller, HttpCode, Param, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetClinicByIdUseCase } from '../../../application/use-cases/get-clinic-by-id.use-case'
import { GetClinicByIdResponseDto } from '../../../application/dtos/get-clinic-by-id-response.dto'
import { ClinicErrorTranslator } from '../errors/clinic-error.translator'

@Controller('clinics')
@ApiTags('Clinics')
export class GetClinicByIdController {
  constructor(private readonly useCase: GetClinicByIdUseCase) {}

  @Get(':clinicId')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getClinic', summary: 'Obtener clínica por ID' })
  @ApiParam({ name: 'clinicId', type: String })
  @ApiResponse({ status: 200, type: GetClinicByIdResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('clinicId') clinicId: string): Promise<GetClinicByIdResponseDto> {
    try {
      return await this.useCase.execute(clinicId)
    } catch (error) {
      ClinicErrorTranslator.translate(error, `/clinics/${clinicId}`)
      throw error
    }
  }
}
