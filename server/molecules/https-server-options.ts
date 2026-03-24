import https from 'node:https';

export interface ResolvedHttpsServerOptions {
  isHttps: boolean;
  options: https.ServerOptions;
}

export async function resolveHttpsServerOptions(): Promise<ResolvedHttpsServerOptions> {
  try {
    const devCerts = await import('office-addin-dev-certs');
    const certs = await devCerts.getHttpsServerOptions();

    console.log('[Setup] SSL: Success');
    return {
      isHttps: true,
      options: { ca: certs.ca, key: certs.key, cert: certs.cert },
    };
  } catch (err: unknown) {
    console.warn('[Setup] SSL: Falling back to HTTP', err instanceof Error ? err.message : String(err));
    return { isHttps: false, options: {} };
  }
}