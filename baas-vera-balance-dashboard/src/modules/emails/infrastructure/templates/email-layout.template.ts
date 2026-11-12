export class EmailLayoutTemplate {
  render(title: string, paragraphs: string[], code?: string): string {
    const content = paragraphs.map(paragraph => `<p style="margin:0 0 16px;line-height:1.6">${this.escape(paragraph)}</p>`).join('')
    const codeBlock = code === undefined ? '' : `<div style="margin:24px 0;padding:20px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;text-align:center;font:700 32px monospace;letter-spacing:8px;color:#115e59">${this.escape(code)}</div>`
    return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${this.escape(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f3f4f6;color:#1f2937;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
<tr><td style="padding:24px 32px;background:#115e59;color:#ffffff;font-size:22px;font-weight:bold">Vera Balance</td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 24px;font-size:24px;line-height:1.3">${this.escape(title)}</h1>${content}${codeBlock}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px">Vera Balance</td></tr>
</table></td></tr></table>
</body></html>`
  }

  private escape(value: string): string {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return value.replace(/[&<>"']/g, character => entities[character])
  }
}
