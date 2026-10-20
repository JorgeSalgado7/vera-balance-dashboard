export interface PasswordPolicyProvider {
  validate(password: string): void;
}
