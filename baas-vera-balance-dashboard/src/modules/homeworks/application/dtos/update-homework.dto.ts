import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator'

export class UpdateHomeworkDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «description» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «description» es obligatorio.' })
  description?: string

}
