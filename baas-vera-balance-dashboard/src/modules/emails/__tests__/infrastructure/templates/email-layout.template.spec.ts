import { EmailLayoutTemplate } from '../../../infrastructure/templates/email-layout.template'

describe('EmailLayoutTemplate', () => {
  const template = new EmailLayoutTemplate()

  it('renders a self-contained Spanish HTML email with inline styling and a shared brand header', () => {
    const html = template.render('Bienvenida', ['Hola Mónica', 'Tu cuenta está lista.'])
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<html lang="es">')
    expect(html).toContain('charset="utf-8"')
    expect(html).toContain('Vera Balance')
    expect(html).toContain('Hola Mónica')
    expect(html).toContain('max-width:600px')
    expect(html).not.toContain('<script')
  })

  it('escapes untrusted title, body and highlighted code content', () => {
    const html = template.render('<script>alert(1)</script>', ['Ana & <img src=x onerror=alert(1)>'], '<b>012345</b>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<b>012345</b>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('Ana &amp; &lt;img')
    expect(html).toContain('&lt;b&gt;012345&lt;/b&gt;')
  })

  it('preserves leading zeroes in the visible recovery code', () => {
    expect(template.render('Recuperación', ['Tu código'], '001234')).toContain('>001234</div>')
  })
})
