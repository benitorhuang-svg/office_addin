import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

export interface ResolvedHttpsServerOptions {
  isHttps: boolean;
  options: https.ServerOptions;
}

export async function resolveHttpsServerOptions(): Promise<ResolvedHttpsServerOptions> {
  // 🛡️ [Docker/Zenith Standard] Priority: Use mounted certificates for containerized HTTPS
  const certPath = path.join(process.cwd(), 'certs');
  const keyFile = path.join(certPath, 'localhost.key');
  const crtFile = path.join(certPath, 'localhost.crt');

  if (fs.existsSync(keyFile) && fs.existsSync(crtFile)) {
    try {
      console.log('[Setup] SSL: Using Industrial Zenith Certificates (Mount)');
      return {
        isHttps: true,
        options: {
          key: fs.readFileSync(keyFile),
          cert: fs.readFileSync(crtFile),
        },
      };
    } catch (e) {
      console.error('[Setup] SSL: Failed to read mounted certs:', e);
    }
  }

  // Fallback for local development without Docker mounts
  try {
    const devCerts = await import('office-addin-dev-certs');
    const certs = await devCerts.getHttpsServerOptions();

    console.log('[Setup] SSL: Success (Dev-Certs)');
    return {
      isHttps: true,
      options: { ca: certs.ca, key: certs.key, cert: certs.cert },
    };
  } catch (err: unknown) {
    console.warn('[Setup] SSL: Falling back to HTTP', err instanceof Error ? err.message : String(err));
    return { isHttps: false, options: {} };
  }
}