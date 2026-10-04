/**
 * Cockpit sign-in switch.
 *
 * false (temporary, 2026-10-04): /cockpit opens without signing in, so ANYONE
 * with the link can see the dashboard, including lead contact details.
 * Device management (adding/revoking authenticator phones) stays locked behind
 * a real session, so nobody can plant a device while the cockpit is open.
 *
 * Set back to true to require Bluvig Authenticator sign-in again.
 */
export const COCKPIT_AUTH_ENABLED = false;
