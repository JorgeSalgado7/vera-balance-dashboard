export interface RequestPasswordRecoveryRepository {
  execute(email: string): Promise<string>
}
