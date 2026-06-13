import {UserScope, type LogtoNextConfig} from '@logto/next';
import {getLogtoContext, type LogtoContext} from '@logto/next/server-actions';

// Logto Cloud configuration. Local dev points at a dev Logto tenant/app;
// production values are set as Netlify env vars. `cookieSecret` encrypts the
// session cookie and must be a long random string; `cookieSecure` requires
// HTTPS, so it is only enabled in production.
export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT ?? '',
  appId: process.env.LOGTO_APP_ID ?? '',
  appSecret: process.env.LOGTO_APP_SECRET ?? '',
  baseUrl: process.env.LOGTO_BASE_URL ?? '',
  cookieSecret: process.env.LOGTO_COOKIE_SECRET ?? '',
  cookieSecure: process.env.NODE_ENV === 'production',
  // Request the user's email so registration can seed User.email. Without this
  // scope Logto omits email from the ID token and userinfo response.
  scopes: [UserScope.Email],
};

// Sign-in callback URL. Register this exact value as a redirect URI in the
// Logto application settings (handled by src/app/callback/route.ts).
export const logtoCallbackUrl = `${logtoConfig.baseUrl}/callback`;

// Read the current auth context (sign-in status + ID-token claims). Safe to call
// in Server Components and other server code.
export function getAuthContext(): Promise<LogtoContext> {
  return getLogtoContext(logtoConfig);
}

// Same, but also hits Logto's userinfo endpoint so `userInfo` (email, etc.) is
// populated. Used at registration to seed the User record; heavier than
// getAuthContext, so prefer that when only sign-in status / sub is needed.
export function getAuthContextWithUserInfo(): Promise<LogtoContext> {
  return getLogtoContext(logtoConfig, {fetchUserInfo: true});
}
