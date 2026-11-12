import { EmailLayoutTemplate } from '../../../infrastructure/templates/email-layout.template'
import { Test } from '@nestjs/testing'
import { SendRecoveryCodeEmailUseCase } from '../../../application/use-cases/send-recovery-code-email.use-case'
import { RecoveryCodeEmailTemplate } from '../../../infrastructure/templates/recovery-code-email.template'

describe('SendRecoveryCodeEmailUseCase', () => {
  const send = jest.fn()
  let useCase: SendRecoveryCodeEmailUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ providers: [
      { provide: RecoveryCodeEmailTemplate, useFactory: () => new RecoveryCodeEmailTemplate(new EmailLayoutTemplate()) },
      { provide: SendRecoveryCodeEmailUseCase, useFactory: (domain: RecoveryCodeEmailTemplate) =>
        new SendRecoveryCodeEmailUseCase(domain, { send }), inject: [RecoveryCodeEmailTemplate] },
    ] }).compile()
    useCase = module.get(SendRecoveryCodeEmailUseCase)
    await module.close()
  })

  it('preserves leading zeros and sends the recovery message to its recipient', async () => {
    await useCase.execute('registered@example.com', '001234')
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'registered@example.com', subject: 'Recuperación de contraseña de Vera Balance', text: 'Tu código de recuperación de contraseña es: 001234' }))
  })

  it('propagates failures to the recovery workflow without retrying delivery', async () => {
    const error = new Error('Delivery unavailable')
    send.mockRejectedValue(error)
    await expect(useCase.execute('registered@example.com', '001234')).rejects.toBe(error)
    expect(send).toHaveBeenCalledTimes(1)
  })
})
