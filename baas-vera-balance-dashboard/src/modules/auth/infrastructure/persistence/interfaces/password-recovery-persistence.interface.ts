export interface PasswordRecoveryPersistence {
  pk: string;
  sk: 'PASSWORD_RECOVERY';
  code_hash: string;
  expires_at: string;
  attempts: number;
  created_at: string;
  ttl: number;
}
