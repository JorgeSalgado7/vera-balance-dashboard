export interface EmailSenderPort {
  send(to: string, subject: string, html: string): Promise<void>;
}
