export interface ResetUserPasswordInput {
  userId: string
  currentPasswordHash: string
  codeHash: string
  expiresAt: string
  passwordHash: string
}

export interface IResetUserPasswordRepository {
  reset(input: ResetUserPasswordInput, updatedAt: string): Promise<boolean>
}
