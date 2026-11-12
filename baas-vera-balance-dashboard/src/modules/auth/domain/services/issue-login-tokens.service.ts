export interface IIssueLoginTokensService {
  issue(userId: string): Promise<{ access_token: string; refresh_token: string }>
}
