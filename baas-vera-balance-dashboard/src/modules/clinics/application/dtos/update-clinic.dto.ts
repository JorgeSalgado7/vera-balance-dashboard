import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TherapyTypeDto } from './therapy-type.dto';

export class UpdateClinicDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    required: false
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    nullable: true
  })
  logo?: string | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    required: false
  })
  address?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    required: false
  })
  phone_number?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TherapyTypeDto)
  @IsOptional()
  @ApiProperty({
    required: false,
    type: TherapyTypeDto,
    isArray: true
  })
  therapy_types?: TherapyTypeDto[];
}