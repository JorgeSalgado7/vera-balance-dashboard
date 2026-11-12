import { SendPasswordUpdatedEmailUseCase } from '../../../../emails/application/use-cases/send-password-updated-email.use-case'
import { PasswordUpdatedEmailTemplate } from '../../../../emails/infrastructure/templates/password-updated-email.template'
import { EmailLayoutTemplate } from '../../../../emails/infrastructure/templates/email-layout.template'
import { Test } from '@nestjs/testing'
import { ChangeUserPasswordUseCase } from '../../../application/use-cases/change-user-password.use-case'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'
import { ValidateChangeUserPasswordDomainService } from '../../../domain/services/validate-change-user-password.domain-service'

describe('ChangeUserPasswordUseCase role-independent access', () => {
  const users = { findById: jest.fn() }
  const verifier = { verify: jest.fn() }
  const hasher = { hash: jest.fn() }
  const updater = { changePassword: jest.fn() }
  const send = jest.fn()
  const reportFailure = jest.fn()
  const input = { current_password: 'Current123!', password: 'NewPassword123!', password_confirmation: 'NewPassword123!' }
  let useCase: ChangeUserPasswordUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    users.findById.mockResolvedValue({ pk: 'actor', email: 'registered@example.com', password: 'stored-hash', updated_at: '2026-01-01T00:00:00.000Z' })
    verifier.verify.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    hasher.hash.mockResolvedValue('new-hash')
    const module = await Test.createTestingModule({ providers: [
      ValidateChangeUserPasswordDomainService,
      { provide: 'Users', useValue: users }, { provide: 'Verifier', useValue: verifier },
      { provide: 'Hasher', useValue: hasher }, { provide: 'Updater', useValue: updater },
      { provide: ChangeUserPasswordUseCase, inject: [ValidateChangeUserPasswordDomainService, 'Users', 'Verifier', 'Hasher', 'Updater'],
        useFactory: (d, u, v, h, updater) => new ChangeUserPasswordUseCase(d, u, v, h, updater,
          new SendPasswordUpdatedEmailUseCase(new PasswordUpdatedEmailTemplate(new EmailLayoutTemplate()), { send }, reportFailure)) }
    ] }).compile()
    useCase = module.get(ChangeUserPasswordUseCase)
    await module.close()
  })

  it('sends a confirmation after changing the password and never includes the password', async () => {
    await useCase.execute('actor', input)
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'registered@example.com', subject: 'Contraseña actualizada en Vera Balance', html: expect.stringContaining('Contraseña actualizada') }))
    expect(send.mock.calls[0][0].html).not.toContain(input.password)
    expect(updater.changePassword.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0])
  })

  it('does not send a confirmation when persistence fails', async () => {
    updater.changePassword.mockRejectedValue(new Error('DynamoDB unavailable'))
    await expect(useCase.execute('actor', input)).rejects.toThrow('DynamoDB unavailable')
    expect(send).not.toHaveBeenCalled()
  })

  it('does not send a confirmation when the current password is wrong', async () => {
    verifier.verify.mockReset().mockResolvedValue(false)
    await expect(useCase.execute('actor', input)).rejects.toThrow()
    expect(send).not.toHaveBeenCalled()
  })

  it('preserves the successful password change when notification delivery fails', async () => {
    send.mockRejectedValue(new Error('Resend unavailable'))
    await expect(useCase.execute('actor', input)).resolves.toEqual({ message: 'Contraseña actualizada' })
    expect(reportFailure).toHaveBeenCalledWith()
  })

  it.each(Object.values(USER_ROLES))('allows actor role %s to change its own password', async role => {
    await expect(useCase.execute('actor', input)).resolves.toEqual({ message: 'Contraseña actualizada' })
    expect(updater.changePassword).toHaveBeenCalled()
  })

  it('changes a password without an authenticated actor after checking the current password', async () => {
    await expect(useCase.execute('actor', input)).resolves.toEqual({ message: 'Contraseña actualizada' })
    expect(verifier.verify).toHaveBeenCalledWith(input.current_password, 'stored-hash')
  })
})
