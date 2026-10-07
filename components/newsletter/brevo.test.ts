import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  mapBrevoErrorCode,
  sendTransactionalEmail,
  TransactionalEmail,
  GENERIC_ERROR,
} from './brevo';

describe('mapBrevoErrorCode', () => {
  it('signale une adresse email invalide', () => {
    expect(mapBrevoErrorCode('invalid_parameter')).toBe(
      'Adresse email invalide',
    );
  });

  it('retombe sur un message générique pour un code inconnu', () => {
    expect(mapBrevoErrorCode(undefined)).toBe(GENERIC_ERROR);
  });
});

describe('sendTransactionalEmail', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envoie un email transactionnel aux destinataires fixes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);

    await sendTransactionalEmail({
      email: TransactionalEmail.AdsAccessRequest,
      params: { ORGANISATION: 'Mairie de Test' },
      replyTo: 'moi@exemple.fr',
      apiKey: 'secret',
    });

    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(init.method).toBe('POST');
    expect(init.headers['api-key']).toBe('secret');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(typeof body.templateId).toBe('number');
    expect(body.params).toEqual({ ORGANISATION: 'Mairie de Test' });
    expect(body.replyTo).toEqual({ email: 'moi@exemple.fr' });
    expect(body.to).toEqual([
      { email: 'tech@rnb.beta.gouv.fr' },
      { email: 'rnb@beta.gouv.fr' },
    ]);
  });
});
