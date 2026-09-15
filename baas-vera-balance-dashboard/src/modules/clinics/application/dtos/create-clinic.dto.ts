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

export class CreateClinicDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    nullable: true
  })
  logo?: string | null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone_number!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TherapyTypeDto)
  @ApiProperty({
    type: TherapyTypeDto,
    isArray: true
  })
  therapy_types!: TherapyTypeDto[];
}