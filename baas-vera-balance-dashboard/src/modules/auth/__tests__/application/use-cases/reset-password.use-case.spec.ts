import { EmailLayoutTemplate } from '../../../../emails/infrastructure/templates/email-layout.template'
import { SendPasswordUpdatedEmailUseCase } from '../../../../emails/application/use-cases/send-password-updated-email.use-case'
import { PasswordUpdatedEmailTemplate } from '../../../../emails/infrastructure/templates/password-updated-email.template'
import { Test } from '@nestjs/testing'
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case'
import { ValidatePasswordRecoveryDomainService } from '../../../domain/services/validate-password-recovery.domain-service'
import { InvalidPasswordRecoveryCodeError } from '../../../domain/errors/invalid-password-recovery-code.error'
import { FindUserByEmailUseCase } from '../../../../users/application/use-cases/find-user-by-email.use-case'
import { ResetUserPasswordUseCase } from '../../../../users/application/use-cases/reset-user-password.use-case'
import { ValidateChangeUserPasswordDomainService } from '../../../../users/domain/services/validate-change-user-password.domain-service'
import { UserPasswordConfirmationMismatchError } from '../../../../users/domain/errors/user-password-confirmation-mismatch.error'
import { InvalidNewUserPasswordError } from '../../../../users/domain/errors/invalid-new-user-password.error'

const now = Date.parse('2026-11-11T00:00:00.000Z')
const user = {
  pk: 'user-id', email: 'user@example.com', password: 'old-password-hash', clinic: null,
  password_recovery_code_hash: 'code-hash', password_recovery_expires_at: '2026-11-11T00:05:00.000Z',
}
const input = { email: 'USER@EXAMPLE.COM', code: '012345', password: 'new password', password_confirmation: 'new password' }

describe('ResetPasswordUseCase', () => {
  const findByEmail = jest.fn()
  const verify = jest.fn()
  const hash = jest.fn()
  const reset = jest.fn()
  const send = jest.fn()
  const reportFailure = jest.fn()
  let useCase: ResetPasswordUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(now)
    findByEmail.mockResolvedValue(user)
    verify.mockResolvedValue(true)
    hash.mockResolvedValue('new-password-hash')
    reset.mockResolvedValue(true)
    const module = await Test.createTestingModule({ providers: [
      ValidatePasswordRecoveryDomainService, ValidateChangeUserPasswordDomainService,
      { provide: ResetPasswordUseCase, useFactory: (recovery: ValidatePasswordRecoveryDomainService, passwords: ValidateChangeUserPasswordDomainService) =>
        new ResetPasswordUseCase(new FindUserByEmailUseCase({ findByEmail }), { verify }, recovery,
          new ResetUserPasswordUseCase(passwords, { hash }, { reset }),
          new SendPasswordUpdatedEmailUseCase(new PasswordUpdatedEmailTemplate(new EmailLayoutTemplate()), { send }, reportFailure)),
        inject: [ValidatePasswordRecoveryDomainService, ValidateChangeUserPasswordDomainService] },
    ] }).compile()
    useCase = module.get(ResetPasswordUseCase)
    await module.close()
  })
  afterEach(() => jest.restoreAllMocks())

  it('validates the code and delegates a hashed password and code snapshot to Users', async () => {
    await expect(useCase.execute(input)).resolves.toEqual({ message: 'Contraseña restablecida' })
    expect(findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: user.email, subject: 'Contraseña actualizada en Vera Balance', text: 'Tu contraseña de Vera Balance se actualizó correctamente.' }))
    expect(reset.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0])
    expect(verify).toHaveBeenCalledWith('012345', 'code-hash')
    expect(hash).toHaveBeenCalledWith('new password')
    expect(reset).toHaveBeenCalledWith({
      userId: 'user-id', currentPasswordHash: 'old-password-hash', codeHash: 'code-hash',
      expiresAt: user.password_recovery_expires_at, passwordHash: 'new-password-hash',
    }, expect.any(String))
  })

  it.each([null, { ...user, password_recovery_code_hash: undefined }])('rejects missing account or code without changing a password', async account => {
    findByEmail.mockResolvedValue(account)
    await expect(useCase.execute(input)).rejects.toThrow(InvalidPasswordRecoveryCodeError)
    expect(verify).not.toHaveBeenCalled()
    expect(hash).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it.each([undefined, 'invalid', '2026-11-10T23:59:59.000Z', '2026-11-11T00:00:00.000Z'])('rejects missing, invalid or expired expiration %p', async expiration => {
    findByEmail.mockResolvedValue({ ...user, password_recovery_expires_at: expiration })
    await expect(useCase.execute(input)).rejects.toThrow(InvalidPasswordRecoveryCodeError)
    expect(hash).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects an incorrect code without hashing or persisting a new password', async () => {
    verify.mockResolvedValue(false)
    await expect(useCase.execute(input)).rejects.toThrow(InvalidPasswordRecoveryCodeError)
    expect(hash).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects password confirmation mismatch using the existing Users domain validation', async () => {
    await expect(useCase.execute({ ...input, password_confirmation: 'different' })).rejects.toThrow(UserPasswordConfirmationMismatchError)
    expect(hash).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a blank password using the existing Users domain validation', async () => {
    await expect(useCase.execute({ ...input, password: ' ', password_confirmation: ' ' })).rejects.toThrow(InvalidNewUserPasswordError)
    expect(hash).not.toHaveBeenCalled()
  })

  it('does not consume the code if the hashing library rejects the new password', async () => {
    hash.mockRejectedValue(new RangeError('unsupported password'))
    await expect(useCase.execute(input)).rejects.toThrow(InvalidNewUserPasswordError)
    expect(reset).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a conditional-write failure caused by expiry, replacement, deletion or concurrent consumption', async () => {
    reset.mockResolvedValue(false)
    await expect(useCase.execute(input)).rejects.toThrow(InvalidPasswordRecoveryCodeError)
    expect(send).not.toHaveBeenCalled()
  })

  it('preserves reset success when delivery fails after the password has changed', async () => {
    send.mockRejectedValue(new Error('Resend unavailable'))
    await expect(useCase.execute(input)).resolves.toEqual({ message: 'Contraseña restablecida' })
    expect(reset).toHaveBeenCalledTimes(1)
    expect(reportFailure).toHaveBeenCalledWith()
  })

  it.each(['lookup', 'verify', 'hash', 'write'])('propagates infrastructure failure at %s', async stage => {
    const error = new Error('Service unavailable')
    const dependency = stage === 'lookup' ? findByEmail : stage === 'verify' ? verify : stage === 'hash' ? hash : reset
    dependency.mockRejectedValue(error)
    await expect(useCase.execute(input)).rejects.toBe(error)
  })
})
