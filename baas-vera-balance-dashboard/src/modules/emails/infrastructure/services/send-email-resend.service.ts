import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppLogger } from '../../../../shared/logger/app-logger.service'
import type { EmailMessage } from '../../domain/entities/email-message'
import type { ISendEmailService } from '../../domain/services/send-email.service'
import { EmailDeliveryError } from '../../domain/errors/email-delivery.error'

@Injectable()
export class SendEmailResendService implements ISendEmailService {
  constructor(private readonly config: ConfigService, private readonly logger: AppLogger = new AppLogger()) {}

  async send(message: EmailMessage): Promise<void> {
    let apiKey: string
    let from: string
    try {
      apiKey = this.config.getOrThrow<string>('RESEND_API_KEY')
      from = this.config.getOrThrow<string>('RESEND_FROM_EMAIL')
      if (!apiKey.trim() || !from.trim()) throw new EmailDeliveryError()
    } catch (error) {
      this.logger.error('SendEmailResendService', 'email.configuration.invalid', undefined,
        { provider: 'resend', hint: 'Revisa RESEND_API_KEY y RESEND_FROM_EMAIL en el entorno de la aplicación.' })
      throw error
    }
    let response: Response
    this.logger.info('SendEmailResendService', 'email.delivery.started', { provider: 'resend' })
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
      })
    } catch (error) {
      this.logger.error('SendEmailResendService', 'email.connection.failed', error, { provider: 'resend' })
      throw new EmailDeliveryError()
    }
    if (!response.ok) {
      const hints: Record<number, string> = {
        400: 'Resend rechazó los datos del correo. Revisa el remitente y el formato del mensaje.',
        401: 'Resend rechazó la autenticación. Revisa RESEND_API_KEY.',
        403: 'Resend rechazó los permisos de envío. Revisa la clave, el remitente y la verificación del dominio.',
        422: 'Resend no pudo validar el correo. Revisa el remitente y los datos de envío.',
        429: 'Resend alcanzó un límite de solicitudes. Revisa los límites de la cuenta.',
      }
      this.logger.error('SendEmailResendService', 'email.provider.rejected', undefined, {
        provider: 'resend', httpStatus: response.status,
        hint: hints[response.status] ?? 'El proveedor no pudo completar el envío. Revisa el estado del servicio.',
      })
      throw new EmailDeliveryError()
    }
    this.logger.info('SendEmailResendService', 'email.provider.accepted', { provider: 'resend', httpStatus: response.status })
  }
}
