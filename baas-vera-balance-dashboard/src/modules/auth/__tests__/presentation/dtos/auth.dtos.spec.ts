import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SignInDto } from '../../../application/dtos/sign-in.dto';
import { ResetPasswordDto } from '../../../application/dtos/reset-password.dto';
import { ForgotPasswordResetDto } from '../../../application/dtos/forgot-password-reset.dto';

describe('Auth request contracts', () => {
  const options = { whitelist: true, forbidNonWhitelisted: true };

  it.each([{}, { email: 'not-an-email', password: 'valid' }, { email: 'user@example.com', password: '   ' }])(
    'rejects absent and malformed login credentials: %j', async body => {
      expect((await validate(plainToInstance(SignInDto, body), options)).length).toBeGreaterThan(0);
    }
  );

  it('normalizes emails before validating', async () => {
    const dto = plainToInstance(SignInDto, { email: ' USER@EXAMPLE.COM ', password: 'valid' });
    expect(dto.email).toBe('user@example.com');
    expect(await validate(dto, options)).toEqual([]);
  });

  it.each(['email', 'user_id', 'id', 'clinic_id', 'password_hash'])(
    'rejects client identity and extra data on authenticated password changes: %s', async field => {
      const dto = plainToInstance(ResetPasswordDto, {
        password: 'long-password', password_confirmation: 'long-password', [field]: 'unexpected'
      });
      expect((await validate(dto, options)).length).toBeGreaterThan(0);
    }
  );

  it('accepts verification_code as OpenAPI specifies and never code as a field alias', async () => {
    const body = { email: 'user@example.com', password: 'long-password', password_confirmation: 'long-password' };
    expect(await validate(plainToInstance(ForgotPasswordResetDto, { ...body, verification_code: '012345' }), options)).toEqual([]);
    expect((await validate(plainToInstance(ForgotPasswordResetDto, { ...body, code: '012345' }), options)).length).toBeGreaterThan(0);
  });

  it.each(['12345', '1234567', '12345a', '', null, 123456])('rejects invalid recovery code %j', async code => {
    const dto = plainToInstance(ForgotPasswordResetDto, {
      email: 'user@example.com', password: 'long-password', password_confirmation: 'long-password', verification_code: code
    });
    expect((await validate(dto, options)).length).toBeGreaterThan(0);
  });
});
