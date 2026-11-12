import { EmailLayoutTemplate } from '../../../infrastructure/templates/email-layout.template'
import { Test } from '@nestjs/testing'
import { SendPasswordUpdatedEmailUseCase } from '../../../application/use-cases/send-password-updated-email.use-case'
import { PasswordUpdatedEmailTemplate } from '../../../infrastructure/templates/password-updated-email.template'

describe('SendPasswordUpdatedEmailUseCase', () => {
  const send = jest.fn()
  const reportFailure = jest.fn()
  let useCase: SendPasswordUpdatedEmailUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ providers: [
      { provide: PasswordUpdatedEmailTemplate, useFactory: () => new PasswordUpdatedEmailTemplate(new EmailLayoutTemplate()) },
      { provide: SendPasswordUpdatedEmailUseCase, useFactory: (domain: PasswordUpdatedEmailTemplate) =>
        new SendPasswordUpdatedEmailUseCase(domain, { send }, reportFailure), inject: [PasswordUpdatedEmailTemplate] },
    ] }).compile()
    useCase = module.get(SendPasswordUpdatedEmailUseCase)
    await module.close()
  })

  it('sends a notification that contains no password or recovery credential', async () => {
    await useCase.execute('registered@example.com')
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'registered@example.com', subject: 'Contraseña actualizada en Vera Balance', text: 'Tu contraseña de Vera Balance se actualizó correctamente.' }))
    expect(reportFailure).not.toHaveBeenCalled()
  })

  it('reports delivery failures without changing the result of an already completed password reset', async () => {
    send.mockRejectedValue(new Error('Sensitive provider details'))
    await expect(useCase.execute('registered@example.com')).resolves.toBeUndefined()
    expect(reportFailure).toHaveBeenCalledWith()
    expect(send).toHaveBeenCalledTimes(1)
  })
})
