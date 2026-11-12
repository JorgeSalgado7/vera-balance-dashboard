import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['Activo', 'Inactivo'] })
  @IsIn(['Activo', 'Inactivo'], { message: 'Selecciona un valor válido para el campo «estado».' })
  status!: 'Activo' | 'Inactivo'
}
