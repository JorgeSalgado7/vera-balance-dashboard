export class SetUserPasswordRecoveryDto {
  userId!: string
  currentPasswordHash!: string
  codeHash!: string
  expiresAt!: string
}
