import {
  Controller,
  Get,
  Param,
  Version
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { GetClinicByUserIdUseCase } from '../../application/use-cases/get-clinic-by-user-id.use-case';
import { ClinicResponseDto } from '../../application/dtos/clinic-response.dto';

@Controller('clinics')
@ApiTags('Clinics')
export class GetClinicByUserIdController {
  constructor(
    private readonly getClinicByUserIdUseCase: GetClinicByUserIdUseCase
  ) {}

  @Version('1')
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get clinic by user id'
  })
  @ApiResponse({
    status: 200,
    type: ClinicResponseDto
  })
  execute(@Param('userId') userId: string) {
    return this.getClinicByUserIdUseCase.execute(userId);
  }
}