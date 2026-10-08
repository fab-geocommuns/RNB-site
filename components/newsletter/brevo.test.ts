import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  BrevoError,
  callBrevo,
  sendTransactionalEmail,
  TransactionalEmail,
} from './brevo';

describe('callBrevo', () => {
  const subscription = {
    email: 'a@b.fr',
    redirectionUrl: 'http://localhost:3000/',
    apiKey: 'secret',
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envoie la souscription à Brevo et résout sur une réponse 2xx', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(callBrevo(subscription)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://api.brevo.com/v3/contacts/doubleOptinConfirmation',
    );
    expect(init.headers['api-key']).toBe('secret');
    expect(JSON.parse(init.body)).toMatchObject({
      email: subscription.email,
      redirectionUrl: subscription.redirectionUrl,
      templateId: expect.any(Number),
      includeListIds: expect.any(Array),
    });
  });

  it('lève une BrevoError sans code quand le corps est illisible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>', { status: 500 })),
    );

    const error = await callBrevo(subscription).catch((e) => e);

    expect(error).toBeInstanceOf(BrevoError);
    expect(error.status).toBe(500);
    expect(error.code).toBeUndefined();
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

  it('lève une BrevoError avec le statut et le code sur une réponse non 2xx', async () => {
    const body = JSON.stringify({ code: 'invalid_parameter' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(body, { status: 400 })),
    );

    const error = await sendTransactionalEmail({
      email: TransactionalEmail.AdsAccessRequest,
      params: {},
      replyTo: 'moi@exemple.fr',
      apiKey: 'secret',
    }).catch((e) => e);

    expect(error).toBeInstanceOf(BrevoError);
    expect(error.status).toBe(400);
    expect(error.code).toBe('invalid_parameter');
    expect(error.message).not.toContain('secret');
  });
});
