import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class PartnerDataDto {
  @ApiProperty()
  @IsString({ message: 'El campo «partner-data.name» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «partner-data.name» es obligatorio.' })
  name!: string

  @ApiProperty()
  @IsString({ message: 'El campo «partner-data.relationship_time» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «partner-data.relationship_time» es obligatorio.' })
  relationship_time!: string

  @ApiProperty()
  @IsString({ message: 'El campo «partner-data.occupation» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «partner-data.occupation» es obligatorio.' })
  occupation!: string
}
