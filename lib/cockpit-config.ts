/**
 * Cockpit sign-in switch.
 *
 * true: /cockpit requires the admin password (ADMIN_PASSWORD).
 * false: /cockpit opens without signing in, so ANYONE with the link can see
 * the dashboard, including lead contact details. Only for emergencies.
 */
export const COCKPIT_AUTH_ENABLED = true;
