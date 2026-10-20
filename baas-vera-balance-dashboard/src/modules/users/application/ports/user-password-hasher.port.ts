export interface UserPasswordHasherPort {
  hash(password: string): Promise<string>;
}
