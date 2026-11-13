import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class GuardianDto {
  @ApiProperty()
  @IsString({ message: 'El campo «guardian.name» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «guardian.name» es obligatorio.' })
  name!: string

  @ApiProperty()
  @IsString({ message: 'El campo «guardian.phone_number» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «guardian.phone_number» es obligatorio.' })
  phone_number!: string

  @ApiProperty()
  @IsString({ message: 'El campo «guardian.relationship» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «guardian.relationship» es obligatorio.' })
  relationship!: string
}
