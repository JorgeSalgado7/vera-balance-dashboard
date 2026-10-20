export class PasswordRecoveryEntity {
  userId!: string;
  codeHash!: string;
  expiresAt!: string;
  attempts!: number;
  createdAt!: string;
  ttl!: number;
}
