import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsIn, IsDateString, Matches, ValidateIf, ValidateNested, IsObject } from 'class-validator'
import { Type } from 'class-transformer'
import { GuardianDto } from './guardian.dto'
import { PartnerDataDto } from './partner-data.dto'
import { GENDER, EDUCATIONAL_LEVEL, MARITAL_STATUS } from '../../domain/constants/patient-catalogs.constant'

export class UpdatePatientDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «name» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «name» es obligatorio.' })
  name?: string

  @ApiPropertyOptional({ format: 'date', example: '2000-01-01' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «birthday» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «birthday» es obligatorio.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD.' })
  @IsDateString({ strict: true }, { message: 'La fecha de nacimiento no es válida.' })
  birthday?: string

  @ApiPropertyOptional({ type: GuardianDto, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsObject({ message: 'El campo «guardian» debe ser un objeto o null.' })
  @ValidateNested()
  @Type(() => GuardianDto)
  guardian?: GuardianDto | null

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString({ message: 'El campo «phone_number» debe ser un texto.' })
  phone_number?: string | null

  @ApiPropertyOptional({ enum: GENDER })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «gender» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «gender» es obligatorio.' })
  @IsIn(GENDER, { message: 'Selecciona un valor válido para «gender».' })
  gender?: typeof GENDER[number]

  @ApiPropertyOptional({ enum: EDUCATIONAL_LEVEL })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «educational_level» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «educational_level» es obligatorio.' })
  @IsIn(EDUCATIONAL_LEVEL, { message: 'Selecciona un valor válido para «educational_level».' })
  educational_level?: typeof EDUCATIONAL_LEVEL[number]

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «occupation» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «occupation» es obligatorio.' })
  occupation?: string

  @ApiPropertyOptional({ enum: MARITAL_STATUS })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «marital_status» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «marital_status» es obligatorio.' })
  @IsIn(MARITAL_STATUS, { message: 'Selecciona un valor válido para «marital_status».' })
  marital_status?: typeof MARITAL_STATUS[number]

  @ApiPropertyOptional({ type: PartnerDataDto, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsObject({ message: 'El campo «partner_data» debe ser un objeto o null.' })
  @ValidateNested()
  @Type(() => PartnerDataDto)
  partner_data?: PartnerDataDto | null

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «religion» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «religion» es obligatorio.' })
  religion?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «address» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «address» es obligatorio.' })
  address?: string

}
