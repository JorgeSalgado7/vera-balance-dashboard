import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ArrayUnique, IsBoolean, IsIn, ValidateIf } from 'class-validator'
import { THERAPEUTIC_PROCESS_STATUS } from '../../domain/constants/therapeutic-process-status.constant'

export class UpdateTherapeuticProcessStatusDto {
  @ApiProperty({ enum: THERAPEUTIC_PROCESS_STATUS })
  @IsIn(THERAPEUTIC_PROCESS_STATUS, { message: 'Selecciona un estado válido para el proceso terapéutico.' })
  status!: typeof THERAPEUTIC_PROCESS_STATUS[number]

}
