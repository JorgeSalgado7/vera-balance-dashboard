export interface IUserTherapeuticProcessesRepository {
  hasTherapeuticProcesses(userId: string): Promise<boolean>
}
