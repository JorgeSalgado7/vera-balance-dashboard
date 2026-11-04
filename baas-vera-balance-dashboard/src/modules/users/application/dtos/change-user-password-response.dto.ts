import { ApiProperty } from '@nestjs/swagger'

export class ChangeUserPasswordResponseDto {
  @ApiProperty()
  message!: string
}
