export function passwordRecoveryEmailTemplate(code: string): string {
  if (!/^[0-9]{6}$/.test(code)) throw new Error('Invalid recovery code format.');
  return `<p>Tu código de recuperación de Vera Balance es <strong>${code}</strong>.</p>
<p>Este código expira en cinco minutos. Si no solicitaste el cambio, ignora este correo.</p>`;
}
