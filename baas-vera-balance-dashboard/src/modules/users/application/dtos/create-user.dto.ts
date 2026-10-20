import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, IsUUID, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty() @IsString() @Matches(/\S/) name!: string;

  @ApiProperty({ format: 'email' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() email!: string;

  @ApiProperty({ format: 'password', minLength: 12 })
  @IsString() @Matches(/\S/) @MinLength(12) password!: string;

  @ApiProperty({ format: 'password' })
  @IsString() @Matches(/\S/) password_confirmation!: string;

  @ApiProperty() @IsString() @Matches(/\S/) professional_license!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() clinic_id!: string;
  @ApiProperty({ enum: ['clinic', 'therapist'] }) @IsIn(['clinic', 'therapist']) role!: 'clinic' | 'therapist';
}
