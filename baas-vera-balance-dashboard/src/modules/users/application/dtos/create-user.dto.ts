import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { IsEmail, IsIn, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name!: string

  @IsEmail()
  @ApiProperty({ format: 'email' })
  email!: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ format: 'password', writeOnly: true })
  password!: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  professional_license!: string

  @IsIn(USER_ROLE_VALUES)
  @ApiProperty({ enum: USER_ROLE_VALUES })
  role!: UserRole

  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  @ApiProperty({
    type: String,
    nullable: true,
  })
  clinic!: string | null
}
