import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HmacRecoveryCodeAdapter } from '../../../infrastructure/providers/hmac-recovery-code.adapter';

describe('HmacRecoveryCodeAdapter', () => {
  let module: TestingModule;
  let codes: HmacRecoveryCodeAdapter;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        HmacRecoveryCodeAdapter,
        { provide: ConfigService, useValue: new ConfigService({ AUTH_RECOVERY_SECRET: 'test-recovery-secret-at-least-32-bytes' }) }
      ]
    }).compile();
    codes = module.get(HmacRecoveryCodeAdapter);
  });
  afterEach(async () => { await module.close(); });

  it('generates six numeric digits and stores only a protected representation', () => {
    const code = codes.generate();
    expect(code).toMatch(/^[0-9]{6}$/);
    const hash = codes.protect('user', code, 'issued-at');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(codes.matches('user', code, 'issued-at', hash)).toBe(true);
    expect(codes.matches('another-user', code, 'issued-at', hash)).toBe(false);
    expect(codes.matches('user', code, 'another-issuance', hash)).toBe(false);
  });

  it.each(['', '12345', '1234567', 'abcdef'])('rejects malformed code %s', code => {
    expect(codes.matches('user', code, 'issued-at', codes.protect('user', '123456', 'issued-at'))).toBe(false);
  });

  it('rejects an incorrect code and malformed stored hash without throwing', () => {
    expect(codes.matches('user', '000000', 'issued-at', codes.protect('user', '111111', 'issued-at'))).toBe(false);
    expect(codes.matches('user', '000000', 'issued-at', 'garbage')).toBe(false);
  });
});
