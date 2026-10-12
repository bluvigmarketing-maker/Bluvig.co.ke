/**
 * Cockpit sign-in switch.
 *
 * true: /cockpit requires a passkey (or Bluvig Authenticator approval).
 * false: /cockpit opens without signing in, so ANYONE with the link can see
 * the dashboard, including lead contact details. Only for emergencies.
 * Device management (adding/revoking passkeys) stays locked behind a real
 * session either way.
 */
export const COCKPIT_AUTH_ENABLED = true;
