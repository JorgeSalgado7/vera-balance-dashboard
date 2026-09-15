import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TherapyTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name!: string;

  @IsString()
  @ApiProperty()
  icon!: string;
}