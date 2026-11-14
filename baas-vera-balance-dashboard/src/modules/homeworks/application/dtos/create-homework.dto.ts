import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class CreateHomeworkDto {
  @ApiProperty()
  @IsString({ message: 'El campo «description» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «description» es obligatorio.' })
  description!: string

  @ApiProperty()
  @IsString({ message: 'El campo «record» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «record» es obligatorio.' })
  record!: string

}
