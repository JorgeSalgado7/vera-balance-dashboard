export interface IDeleteUserRepository {
  delete(userId: string): Promise<void>;
}
