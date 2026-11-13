import { Controller, HttpCode, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { GetClinicsUseCase } from '../../../application/use-cases/get-clinics.use-case'
import { GetClinicsResponseDto } from '../../../application/dtos/get-clinics-response.dto'
import { ClinicErrorTranslator } from '../errors/clinic-error.translator'

@Controller('clinics')
@ApiTags('Clinics')
export class GetClinicsController {
  constructor(private readonly useCase: GetClinicsUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getClinics', summary: 'Obtener clínicas' })
  @ApiResponse({ status: 200, type: GetClinicsResponseDto, isArray: true })
  @ApiResponse({ status: 500 })
  async execute(): Promise<GetClinicsResponseDto[]> {
    try {
      return await this.useCase.execute()
    } catch (error) {
      ClinicErrorTranslator.translate(error, '/clinics')
      throw error
    }
  }
}
