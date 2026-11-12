import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, ValidateIf } from 'class-validator'

export class CreateTherapyTypeDto {
  @ApiProperty()
  @IsString()
  name!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  icon?: string | null
}
