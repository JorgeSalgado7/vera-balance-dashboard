import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsIn, IsDateString, Matches, ValidateIf, ValidateNested, IsObject } from 'class-validator'
import { Type } from 'class-transformer'
import { GuardianDto } from './guardian.dto'
import { PartnerDataDto } from './partner-data.dto'
import { GENDER, EDUCATIONAL_LEVEL, MARITAL_STATUS } from '../../domain/constants/patient-catalogs.constant'

export class CreatePatientDto {
  @ApiProperty()
  @IsString({ message: 'El campo «clinic» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «clinic» es obligatorio.' })
  clinic!: string

  @ApiProperty()
  @IsString({ message: 'El campo «name» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «name» es obligatorio.' })
  name!: string

  @ApiProperty({ format: 'date', example: '2000-01-01' })
  @IsString({ message: 'El campo «birthday» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «birthday» es obligatorio.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD.' })
  @IsDateString({ strict: true }, { message: 'La fecha de nacimiento no es válida.' })
  birthday!: string

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

  @ApiProperty({ enum: GENDER })
  @IsString({ message: 'El campo «gender» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «gender» es obligatorio.' })
  @IsIn(GENDER, { message: 'Selecciona un valor válido para «gender».' })
  gender!: typeof GENDER[number]

  @ApiProperty({ enum: EDUCATIONAL_LEVEL })
  @IsString({ message: 'El campo «educational_level» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «educational_level» es obligatorio.' })
  @IsIn(EDUCATIONAL_LEVEL, { message: 'Selecciona un valor válido para «educational_level».' })
  educational_level!: typeof EDUCATIONAL_LEVEL[number]

  @ApiProperty()
  @IsString({ message: 'El campo «occupation» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «occupation» es obligatorio.' })
  occupation!: string

  @ApiProperty({ enum: MARITAL_STATUS })
  @IsString({ message: 'El campo «marital_status» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «marital_status» es obligatorio.' })
  @IsIn(MARITAL_STATUS, { message: 'Selecciona un valor válido para «marital_status».' })
  marital_status!: typeof MARITAL_STATUS[number]

  @ApiPropertyOptional({ type: PartnerDataDto, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsObject({ message: 'El campo «partner_data» debe ser un objeto o null.' })
  @ValidateNested()
  @Type(() => PartnerDataDto)
  partner_data?: PartnerDataDto | null

  @ApiProperty()
  @IsString({ message: 'El campo «religion» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «religion» es obligatorio.' })
  religion!: string

  @ApiProperty()
  @IsString({ message: 'El campo «address» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «address» es obligatorio.' })
  address!: string

}
