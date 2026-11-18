export interface ResetPasswordDto {
  email: string
  code: string
  password: string
  password_confirmation: string
}
