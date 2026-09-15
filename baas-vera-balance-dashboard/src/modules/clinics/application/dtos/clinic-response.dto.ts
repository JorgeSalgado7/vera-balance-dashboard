import { ApiProperty } from '@nestjs/swagger';
import { TherapyTypeDto } from './therapy-type.dto';

export class ClinicResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    nullable: true
  })
  logo!: string | null;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  phone_number!: string;

  @ApiProperty({
    type: TherapyTypeDto,
    isArray: true
  })
  therapy_types!: TherapyTypeDto[];
}