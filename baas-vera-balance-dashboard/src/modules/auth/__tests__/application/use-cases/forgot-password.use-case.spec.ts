import { EmailLayoutTemplate } from '../../../../emails/infrastructure/templates/email-layout.template'
import { SendRecoveryCodeEmailUseCase } from '../../../../emails/application/use-cases/send-recovery-code-email.use-case'
import { RecoveryCodeEmailTemplate } from '../../../../emails/infrastructure/templates/recovery-code-email.template'
import { Test } from '@nestjs/testing'
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case'
import { FindUserByEmailUseCase } from '../../../../users/application/use-cases/find-user-by-email.use-case'
import { SetUserPasswordRecoveryUseCase } from '../../../../users/application/use-cases/set-user-password-recovery.use-case'
import { CreatePasswordRecoveryDomainService } from '../../../domain/services/create-password-recovery.domain-service'

describe('ForgotPasswordUseCase', () => {
  const user = { pk: 'user-id', name: 'User', email: 'registered@example.com', password: 'password-hash', role: 'therapist', status: 'Activo', clinic: null }
  const findByEmail = jest.fn()
  const set = jest.fn()
  const generate = jest.fn()
  const hash = jest.fn()
  const send = jest.fn()
  const reportFailure = jest.fn()
  let useCase: ForgotPasswordUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    findByEmail.mockResolvedValue(user)
    set.mockResolvedValue(true)
    generate.mockReturnValue('012345')
    hash.mockResolvedValue('recovery-code-hash')
    const module = await Test.createTestingModule({ providers: [
      CreatePasswordRecoveryDomainService,
      { provide: ForgotPasswordUseCase, useFactory: (domain: CreatePasswordRecoveryDomainService) =>
        new ForgotPasswordUseCase(new FindUserByEmailUseCase({ findByEmail }),
          new SetUserPasswordRecoveryUseCase({ set }), { generate }, domain, { hash }, new SendRecoveryCodeEmailUseCase(new RecoveryCodeEmailTemplate(new EmailLayoutTemplate()), { send }), reportFailure),
        inject: [CreatePasswordRecoveryDomainService] },
    ] }).compile()
    useCase = module.get(ForgotPasswordUseCase)
    await module.close()
  })

  it('responds before looking up the account, stores only a hash and emails the registered address', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-11T00:00:00.000Z'))
    try {
      const response = useCase.execute({ email: ' INPUT@EXAMPLE.COM ' })
      expect(findByEmail).not.toHaveBeenCalled()
      expect(Object.keys(response)).toEqual(['message'])
      await useCase.waitForPendingRequests()
      expect(findByEmail).toHaveBeenCalledWith('input@example.com')
      expect(hash).toHaveBeenCalledWith('012345')
      expect(set).toHaveBeenCalledWith({ userId: 'user-id', currentPasswordHash: 'password-hash', codeHash: 'recovery-code-hash', expiresAt: '2026-11-11T00:05:00.000Z' }, expect.any(String))
      expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'registered@example.com', subject: 'Recuperación de contraseña de Vera Balance', text: 'Tu código de recuperación de contraseña es: 012345' }))
      expect(set.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0])
      expect(JSON.stringify(response)).not.toContain('012345')
      expect(reportFailure).not.toHaveBeenCalled()
    } finally { now.mockRestore() }
  })

  it('returns the same response for existing and unknown accounts', async () => {
    const known = useCase.execute({ email: user.email })
    await useCase.waitForPendingRequests()
    findByEmail.mockResolvedValue(null)
    send.mockClear()
    hash.mockClear()
    const unknown = useCase.execute({ email: 'unknown@example.com' })
    await useCase.waitForPendingRequests()
    expect(unknown).toEqual(known)
    expect(send).not.toHaveBeenCalled()
    expect(hash).not.toHaveBeenCalled()
  })

  it.each(['lookup', 'hash', 'store', 'send'])('does not reveal account existence when %s fails', async stage => {
    const dependency = stage === 'lookup' ? findByEmail : stage === 'hash' ? hash : stage === 'store' ? set : send
    dependency.mockRejectedValue(new Error('private email or code details'))
    const response = useCase.execute({ email: user.email })
    await expect(useCase.waitForPendingRequests()).resolves.toBeUndefined()
    expect(response).toEqual({ message: 'Si el correo está registrado, recibirás un código de recuperación.' })
    expect(reportFailure).toHaveBeenCalledWith()
    if (stage !== 'send') expect(send).not.toHaveBeenCalled()
  })

  it('does not email a code if the user was removed or the password changed before persistence', async () => {
    set.mockResolvedValue(false)
    useCase.execute({ email: user.email })
    await useCase.waitForPendingRequests()
    expect(send).not.toHaveBeenCalled()
  })

  it('does not limit repeated requests', async () => {
    for (let request = 0; request < 10; request++) useCase.execute({ email: user.email })
    await useCase.waitForPendingRequests()
    expect(set).toHaveBeenCalledTimes(10)
    expect(send).toHaveBeenCalledTimes(10)
  })
})
