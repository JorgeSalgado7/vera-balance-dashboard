import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResendEmailAdapter } from '../../../infrastructure/providers/resend-email.adapter';

describe('ResendEmailAdapter', () => {
  let module: TestingModule;
  let fetchMock: jest.SpyInstance;

  beforeEach(async () => {
    fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, body: { cancel: jest.fn().mockResolvedValue(undefined) }
    } as unknown as Response);
    module = await Test.createTestingModule({
      providers: [
        ResendEmailAdapter,
        { provide: ConfigService, useValue: new ConfigService({
          RESEND_API_KEY: 'test-resend-key', RESEND_FROM_EMAIL: 'Vera Balance <test@example.com>'
        }) }
      ]
    }).compile();
  });
  afterEach(async () => { fetchMock.mockRestore(); await module.close(); });

  it('sends through Resend using server-side configuration without a new SDK dependency', async () => {
    await module.get(ResendEmailAdapter).send('user@example.com', 'Recovery', '<p>Code</p>');
    expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
      method: 'POST',
      headers: { Authorization: 'Bearer test-resend-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Vera Balance <test@example.com>', to: ['user@example.com'], subject: 'Recovery', html: '<p>Code</p>'
      })
    }));
  });

  it.each(['http', 'network'])('sanitizes %s errors instead of exposing provider data or credentials', async failure => {
    if (failure === 'http') fetchMock.mockResolvedValue({ ok: false } as Response);
    else fetchMock.mockRejectedValue(new Error('Provider response with sensitive content'));
    await expect(module.get(ResendEmailAdapter).send('user@example.com', 'Recovery', '<p>Code</p>'))
      .rejects.toThrow('Email delivery failed.');
  });
});
