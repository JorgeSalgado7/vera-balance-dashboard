export class EmailDeliveryError extends Error {
  constructor() {
    super('No se pudo enviar el correo.')
    this.name = 'EmailDeliveryError'
  }
}
