import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['Activo', 'Inactivo'] })
  @IsIn(['Activo', 'Inactivo'])
  status!: 'Activo' | 'Inactivo'
}
