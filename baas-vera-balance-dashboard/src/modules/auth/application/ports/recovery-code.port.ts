export interface RecoveryCodePort {
  generate(): string;
  protect(userId: string, code: string, createdAt: string): string;
  matches(userId: string, code: string, createdAt: string, codeHash: string): boolean;
}
