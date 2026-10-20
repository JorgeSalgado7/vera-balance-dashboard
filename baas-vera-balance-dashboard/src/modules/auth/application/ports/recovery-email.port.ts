export interface RecoveryEmailPort {
  send(email: string, code: string): Promise<void>;
}
