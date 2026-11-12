export interface SetUserPasswordRecoveryInput {
  userId: string
  currentPasswordHash: string
  codeHash: string
  expiresAt: string
}

export interface ISetUserPasswordRecoveryRepository {
  set(input: SetUserPasswordRecoveryInput, updatedAt: string): Promise<boolean>
}
