import { SendWelcomeEmailUseCase } from '../application/use-cases/send-welcome-email.use-case'
import { Test } from '@nestjs/testing'
import { MODULE_METADATA } from '@nestjs/common/constants'
import { EmailsModule } from '../emails.module'
import { SendRecoveryCodeEmailUseCase } from '../application/use-cases/send-recovery-code-email.use-case'
import { SendPasswordUpdatedEmailUseCase } from '../application/use-cases/send-password-updated-email.use-case'
import { SendEmailResendService } from '../infrastructure/services/send-email-resend.service'

describe('EmailsModule', () => {
  it('exports only its use cases and shares the configured transport between email types', async () => {
    const send = jest.fn()
    const module = await Test.createTestingModule({ imports: [EmailsModule] })
      .overrideProvider(SendEmailResendService).useValue({ send }).compile()
    try {
      await module.get(SendRecoveryCodeEmailUseCase).execute('user@example.com', '012345')
      await module.get(SendPasswordUpdatedEmailUseCase).execute('user@example.com')
      await module.get(SendWelcomeEmailUseCase).execute('user@example.com', 'User')
      expect(send).toHaveBeenCalledTimes(3)
      expect(send.mock.calls.map(([message]) => message.to)).toEqual(['user@example.com', 'user@example.com', 'user@example.com'])
      expect(send.mock.calls[0][0].text).toContain('012345')
      expect(send.mock.calls[1][0].text).not.toContain('012345')
      expect(send.mock.calls.every(([message]) => message.html.startsWith('<!doctype html>'))).toBe(true)
      expect(send.mock.calls[0][0].html).toContain('>012345</div>')
      expect(send.mock.calls[1][0].html).toContain('Contraseña actualizada')
      expect(send.mock.calls[2][0].html).toContain('Te damos la bienvenida')
      expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, EmailsModule)).toEqual([SendRecoveryCodeEmailUseCase, SendPasswordUpdatedEmailUseCase, SendWelcomeEmailUseCase])
    } finally { await module.close() }
  })
})
