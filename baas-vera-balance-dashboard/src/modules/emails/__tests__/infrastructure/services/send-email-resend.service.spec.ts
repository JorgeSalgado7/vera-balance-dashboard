import { ConfigService } from '@nestjs/config'
import { SendEmailResendService } from '../../../infrastructure/services/send-email-resend.service'
import { EmailDeliveryError } from '../../../domain/errors/email-delivery.error'

describe('SendEmailResendService', () => {
  const config = new ConfigService({ RESEND_API_KEY: 'test-api-key', RESEND_FROM_EMAIL: 'Vera Balance <sender@example.com>' })
  const service = new SendEmailResendService(config)
  const message = { to: 'user@example.com', subject: 'Recuperación de contraseña de Vera Balance', text: 'Tu código de recuperación de contraseña es: test-code', html: '<p>test-code</p>' }
  let fetchMock: jest.SpiedFunction<typeof fetch>

  beforeEach(() => { fetchMock = jest.spyOn(globalThis, 'fetch') })
  afterEach(() => { jest.restoreAllMocks() })

  it('sends the code by Resend without making a real network request', async () => {
    fetchMock.mockResolvedValue({ ok: true } as Response)
    await expect(service.send(message)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-api-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Vera Balance <sender@example.com>', to: ['user@example.com'],
        subject: 'Recuperación de contraseña de Vera Balance',
        text: 'Tu código de recuperación de contraseña es: test-code',
        html: '<p>test-code</p>',
      }),
    })
  })

  it('reports provider rejection without exposing credentials or the code', async () => {
    fetchMock.mockResolvedValue({ ok: false } as Response)
    await expect(service.send(message)).rejects.toThrow(EmailDeliveryError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reports transport failures without leaking their contents', async () => {
    fetchMock.mockRejectedValue(new Error('sensitive transport details'))
    await expect(service.send(message)).rejects.toThrow('No se pudo enviar el correo.')
  })

  it('requires configuration before sending any email', async () => {
    const missing = new ConfigService()
    jest.spyOn(missing, 'getOrThrow').mockImplementation(() => { throw new Error('Missing configuration') })
    await expect(new SendEmailResendService(missing).send(message)).rejects.toThrow('Missing configuration')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
