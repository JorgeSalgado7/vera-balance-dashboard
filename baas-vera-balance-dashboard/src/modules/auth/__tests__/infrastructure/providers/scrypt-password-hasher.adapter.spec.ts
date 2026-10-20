import { Test, TestingModule } from '@nestjs/testing';
import { ScryptPasswordHasherAdapter } from '../../../../../shared/security/scrypt-password-hasher.adapter';

describe('ScryptPasswordHasherAdapter', () => {
  let module: TestingModule;
  let passwords: ScryptPasswordHasherAdapter;
  beforeEach(async () => {
    module = await Test.createTestingModule({ providers: [ScryptPasswordHasherAdapter] }).compile();
    passwords = module.get(ScryptPasswordHasherAdapter);
  });
  afterEach(async () => { await module.close(); });

  it('salts password hashes and verifies the original password only', async () => {
    const first = await passwords.hash('A long test password');
    const second = await passwords.hash('A long test password');
    expect(first).not.toBe(second);
    expect(first).not.toContain('A long test password');
    await expect(passwords.verify('A long test password', first)).resolves.toBe(true);
    await expect(passwords.verify('different', first)).resolves.toBe(false);
    await expect(passwords.verify('anything', 'invalid-hash')).resolves.toBe(false);
  }, 30_000);
});
