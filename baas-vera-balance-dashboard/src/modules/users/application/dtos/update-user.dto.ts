import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, Matches, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional() @ValidateIf((_, value) => value !== undefined)
  @IsString() @Matches(/\S/) name?: string;

  @ApiPropertyOptional({ format: 'email' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @ValidateIf((_, value) => value !== undefined) @IsEmail() email?: string;

  @ApiPropertyOptional() @ValidateIf((_, value) => value !== undefined)
  @IsString() @Matches(/\S/) professional_license?: string;

  @ApiPropertyOptional({ enum: ['clinic', 'therapist'] })
  @ValidateIf((_, value) => value !== undefined) @IsIn(['clinic', 'therapist']) role?: 'clinic' | 'therapist';
}
