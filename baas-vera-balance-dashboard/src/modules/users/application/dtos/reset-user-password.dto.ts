export class ResetUserPasswordDto {
  userId!: string
  currentPasswordHash!: string
  codeHash!: string
  expiresAt!: string
  passwordHash!: string
}
