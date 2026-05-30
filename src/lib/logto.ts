import type {LogtoNextConfig} from '@logto/next';
import {getLogtoContext, type LogtoContext} from '@logto/next/server-actions';

// Logto Cloud configuration. Local dev points at a dev Logto tenant/app;
// production values are set in Vercel env vars. `cookieSecret` encrypts the
// session cookie and must be a long random string; `cookieSecure` requires
// HTTPS, so it is only enabled in production.
export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT ?? '',
  appId: process.env.LOGTO_APP_ID ?? '',
  appSecret: process.env.LOGTO_APP_SECRET ?? '',
  baseUrl: process.env.LOGTO_BASE_URL ?? '',
  cookieSecret: process.env.LOGTO_COOKIE_SECRET ?? '',
  cookieSecure: process.env.NODE_ENV === 'production',
};

// Sign-in callback URL. Register this exact value as a redirect URI in the
// Logto application settings (handled by src/app/callback/route.ts).
export const logtoCallbackUrl = `${logtoConfig.baseUrl}/callback`;

// Read the current auth context (sign-in status + user claims). Safe to call
// in Server Components and other server code.
export function getAuthContext(): Promise<LogtoContext> {
  return getLogtoContext(logtoConfig);
}
