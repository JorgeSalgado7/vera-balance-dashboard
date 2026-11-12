import type { AppLogger } from '../../../../../shared/logger/app-logger.service'
import { ConfigService } from '@nestjs/config'
import { SendEmailResendService } from '../../../infrastructure/services/send-email-resend.service'
import { EmailDeliveryError } from '../../../domain/errors/email-delivery.error'

describe('SendEmailResendService', () => {
  const config = new ConfigService({ RESEND_API_KEY: 'test-api-key', RESEND_FROM_EMAIL: 'Vera Balance <sender@example.com>' })
  const logger = { info: jest.fn(), error: jest.fn() }
  const service = new SendEmailResendService(config, logger as unknown as AppLogger)
  const message = { to: 'user@example.com', subject: 'Recuperación de contraseña de Vera Balance', text: 'Tu código de recuperación de contraseña es: test-code', html: '<p>test-code</p>' }
  let fetchMock: jest.SpiedFunction<typeof fetch>

  beforeEach(() => { jest.clearAllMocks(); fetchMock = jest.spyOn(globalThis, 'fetch') })
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
  it.each([400, 401, 403, 422, 429, 500])('logs provider status %s and a safe diagnostic hint', async status => {
    const json = jest.fn()
    fetchMock.mockResolvedValue({ ok: false, status, json } as unknown as Response)
    await expect(service.send(message)).rejects.toBeInstanceOf(EmailDeliveryError)
    expect(logger.error).toHaveBeenCalledWith('SendEmailResendService', 'email.provider.rejected', undefined,
      expect.objectContaining({ provider: 'resend', httpStatus: status, hint: expect.any(String) }))
    expect(json).not.toHaveBeenCalled()
    const logs = JSON.stringify(logger.error.mock.calls)
    expect(logs).not.toContain('test-api-key')
    expect(logs).not.toContain('user@example.com')
    expect(logs).not.toContain('test-code')
  })

  it('distinguishes provider acceptance from actual delivery', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response)
    await service.send(message)
    expect(logger.info).toHaveBeenCalledWith('SendEmailResendService', 'email.provider.accepted', { provider: 'resend', httpStatus: 200 })
  })

})
