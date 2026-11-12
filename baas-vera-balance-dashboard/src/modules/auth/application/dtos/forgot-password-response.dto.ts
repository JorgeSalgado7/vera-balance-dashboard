import { ApiProperty } from '@nestjs/swagger'

export class ForgotPasswordResponseDto {
  @ApiProperty()
  message!: string
}
