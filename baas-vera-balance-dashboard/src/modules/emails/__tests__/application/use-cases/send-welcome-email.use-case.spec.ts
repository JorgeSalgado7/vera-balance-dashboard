import { Test } from '@nestjs/testing'
import { SendWelcomeEmailUseCase } from '../../../application/use-cases/send-welcome-email.use-case'
import { WelcomeEmailTemplate } from '../../../infrastructure/templates/welcome-email.template'
import { EmailLayoutTemplate } from '../../../infrastructure/templates/email-layout.template'

describe('SendWelcomeEmailUseCase', () => {
  const send = jest.fn()
  const reportFailure = jest.fn()
  let useCase: SendWelcomeEmailUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ providers: [
      { provide: SendWelcomeEmailUseCase, useFactory: () =>
        new SendWelcomeEmailUseCase(new WelcomeEmailTemplate(new EmailLayoutTemplate()), { send }, reportFailure) },
    ] }).compile()
    useCase = module.get(SendWelcomeEmailUseCase)
    await module.close()
  })

  it('sends HTML and plain text welcome content to the new user without allowing HTML injection', async () => {
    await useCase.execute('registered@example.com', 'Ana & <script>alert(1)</script>')
    const message = send.mock.calls[0][0]
    expect(message.to).toBe('registered@example.com')
    expect(message.subject).toBe('Bienvenida a Vera Balance')
    expect(message.text).toContain('Hola Ana & <script>alert(1)</script>,')
    expect(message.html).toContain('Ana &amp; &lt;script&gt;')
    expect(message.html).not.toContain('<script>')
    expect(message.html).toContain('Tu cuenta se creó correctamente.')
    expect(reportFailure).not.toHaveBeenCalled()
  })

  it('reports delivery failure without failing an already completed user creation', async () => {
    send.mockRejectedValue(new Error('Resend unavailable'))
    await expect(useCase.execute('registered@example.com', 'User')).resolves.toBeUndefined()
    expect(reportFailure).toHaveBeenCalledWith()
    expect(send).toHaveBeenCalledTimes(1)
  })
})
