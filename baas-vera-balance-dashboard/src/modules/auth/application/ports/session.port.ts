export interface SessionPort {
  issue(userId: string): Promise<string>;
  verify(token: string): Promise<string>;
}
