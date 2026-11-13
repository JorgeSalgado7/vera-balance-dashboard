import { Controller, HttpCode, Param, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { GetClinicUsersUseCase } from '../../../application/use-cases/get-clinic-users.use-case'
import { GetUsersResponseDto } from '../../../../users/application/dtos/get-users-response.dto'
import { ClinicErrorTranslator } from '../errors/clinic-error.translator'

@Controller('clinics')
@ApiTags('Clinics')
export class GetClinicUsersController {
  constructor(private readonly useCase: GetClinicUsersUseCase) {}

  @Get(':clinicId/therapists')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getClinicTherapists', summary: 'Obtener usuarios ligados a una clínica', description: 'Devuelve todos los usuarios asociados a la clínica, sin filtrar por rol.' })
  @ApiParam({ name: 'clinicId', type: String })
  @ApiResponse({ status: 200, type: GetUsersResponseDto, isArray: true })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  async execute(@Param('clinicId') clinicId: string): Promise<GetUsersResponseDto[]> {
    try {
      return await this.useCase.execute(clinicId)
    } catch (error) {
      ClinicErrorTranslator.translate(error, `/clinics/${clinicId}/therapists`)
      throw error
    }
  }
}
