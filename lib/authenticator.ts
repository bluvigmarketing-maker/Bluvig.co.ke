import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Bluvig Authenticator — number-matching sign-in for /cockpit.
 *
 * 1. /cockpit/login creates a LoginRequest and shows its number.
 * 2. An enrolled phone unlocks /authenticator with its passkey and sees the
 *    request as three numbers; tapping the right one approves it.
 * 3. The waiting browser (proved by a secret cookie) is issued a session.
 *
 * Stored as JSON like lib/leads.ts. Like leads, this needs a hosted DB before
 * deploying to serverless hosting (Vercel): the filesystem there isn't persistent.
 */

export interface Device {
  id: string; // WebAuthn credential ID (base64url)
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export type LoginStatus = "pending" | "approved" | "denied" | "consumed" | "cancelled";

export interface LoginRequest {
  id: string;
  number: number;
  options: number[];
  secretHash: string;
  status: LoginStatus;
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ip: string;
}

interface Ceremony {
  id: string;
  kind: "register" | "authenticate";
  challenge: string;
  deviceName?: string;
  enrollCodeHash?: string;
  expiresAt: string;
}

interface EnrollCode {
  codeHash: string;
  expiresAt: string;
}

interface Store {
  devices: Device[];
  loginRequests: LoginRequest[];
  ceremonies: Ceremony[];
  enrollCodes: EnrollCode[];
}

export const LOGIN_REQUEST_TTL_MS = 2 * 60 * 1000;
const CEREMONY_TTL_MS = 5 * 60 * 1000;
const ENROLL_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_PENDING_REQUESTS = 5;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "authenticator.json");

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const isLive = (expiresAt: string) => new Date(expiresAt).getTime() > Date.now();

function read(): Store {
  const empty: Store = { devices: [], loginRequests: [], ceremonies: [], enrollCodes: [] };
  if (!existsSync(DATA_FILE)) return empty;
  try {
    return { ...empty, ...(JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Partial<Store>) };
  } catch {
    return empty;
  }
}

/** Read-modify-write; drops expired requests, ceremonies and codes on every write. */
function update<T>(fn: (store: Store) => T): T {
  const store = read();
  const result = fn(store);
  // Keep resolved login requests briefly so the waiting browser can read the outcome.
  store.loginRequests = store.loginRequests.filter(
    (r) => new Date(r.expiresAt).getTime() > Date.now() - 60_000
  );
  store.ceremonies = store.ceremonies.filter((c) => isLive(c.expiresAt));
  store.enrollCodes = store.enrollCodes.filter((c) => isLive(c.expiresAt));
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  return result;
}

// ── Devices ──────────────────────────────────────────────────────────────

export function getDevices(): Device[] {
  return read().devices;
}

export function hasDevices(): boolean {
  return read().devices.length > 0;
}

export function findDevice(id: string): Device | undefined {
  return read().devices.find((d) => d.id === id);
}

export function addDevice(device: Omit<Device, "createdAt" | "lastUsedAt">) {
  update((store) => {
    store.devices = store.devices.filter((d) => d.id !== device.id);
    store.devices.push({ ...device, createdAt: new Date().toISOString(), lastUsedAt: null });
  });
}

export function touchDevice(id: string, counter: number) {
  update((store) => {
    const device = store.devices.find((d) => d.id === id);
    if (device) {
      device.counter = counter;
      device.lastUsedAt = new Date().toISOString();
    }
  });
}

export function removeDevice(id: string): boolean {
  return update((store) => {
    const before = store.devices.length;
    store.devices = store.devices.filter((d) => d.id !== id);
    return store.devices.length < before;
  });
}

// ── Enrolment codes (for adding a phone from inside the cockpit) ─────────

/** Returns a one-time code like "K7Q2-M9XD", valid for 10 minutes. */
export function createEnrollCode(): { code: string; expiresAt: string } {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const raw = Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join("");
  const code = `${raw.slice(0, 4)}-${raw.slice(4)}`;
  const expiresAt = new Date(Date.now() + ENROLL_CODE_TTL_MS).toISOString();
  update((store) => {
    store.enrollCodes.push({ codeHash: hash(normalizeCode(code)), expiresAt });
  });
  return { code, expiresAt };
}

function normalizeCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidEnrollCode(code: string): boolean {
  const codeHash = hash(normalizeCode(code));
  return read().enrollCodes.some((c) => c.codeHash === codeHash && isLive(c.expiresAt));
}

// ── WebAuthn ceremonies (server-side challenge storage) ─────────────────

export function startCeremony(
  kind: Ceremony["kind"],
  challenge: string,
  extra: { deviceName?: string; enrollCode?: string } = {}
): string {
  const id = randomUUID();
  update((store) => {
    store.ceremonies.push({
      id,
      kind,
      challenge,
      deviceName: extra.deviceName,
      enrollCodeHash: extra.enrollCode ? hash(normalizeCode(extra.enrollCode)) : undefined,
      expiresAt: new Date(Date.now() + CEREMONY_TTL_MS).toISOString(),
    });
  });
  return id;
}

/** One-shot: removes the ceremony (and its enrolment code, if any) as it's read. */
export function consumeCeremony(id: string, kind: Ceremony["kind"]): Ceremony | null {
  return update((store) => {
    const ceremony = store.ceremonies.find(
      (c) => c.id === id && c.kind === kind && isLive(c.expiresAt)
    );
    store.ceremonies = store.ceremonies.filter((c) => c.id !== id);
    if (ceremony?.enrollCodeHash) {
      const valid = store.enrollCodes.some(
        (c) => c.codeHash === ceremony.enrollCodeHash && isLive(c.expiresAt)
      );
      store.enrollCodes = store.enrollCodes.filter((c) => c.codeHash !== ceremony.enrollCodeHash);
      if (!valid) return null;
    }
    return ceremony ?? null;
  });
}

// ── Login requests (number matching) ────────────────────────────────────

/** Two distinct decoys plus the real number, shuffled. All two-digit. */
function numberOptions(): { number: number; options: number[] } {
  const picks = new Set<number>();
  while (picks.size < 3) picks.add(randomInt(10, 100));
  const options = [...picks];
  const number = options[0];
  for (let i = options.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { number, options };
}

export function createLoginRequest(meta: {
  userAgent: string;
  ip: string;
  /** The same browser's previous request (from its cookie) — cancelled so the phone never shows stale requests. */
  replaces?: { id: string; secret: string };
}) {
  return update((store) => {
    const previous = meta.replaces
      ? store.loginRequests.find(
          (r) => r.id === meta.replaces!.id && r.secretHash === hash(meta.replaces!.secret)
        )
      : undefined;
    if (previous?.status === "pending") previous.status = "cancelled";

    const pending = store.loginRequests.filter(
      (r) => r.status === "pending" && isLive(r.expiresAt)
    );
    if (pending.length >= MAX_PENDING_REQUESTS) return null;

    const secret = randomBytes(32).toString("base64url");
    const { number, options } = numberOptions();
    const request: LoginRequest = {
      id: randomUUID(),
      number,
      options,
      secretHash: hash(secret),
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + LOGIN_REQUEST_TTL_MS).toISOString(),
      userAgent: meta.userAgent.slice(0, 200),
      ip: meta.ip.slice(0, 64),
    };
    store.loginRequests.push(request);
    return { request, secret };
  });
}

export type LoginOutcome = LoginStatus | "expired" | "unknown";

/**
 * Called by the waiting browser. Returns "approved" exactly once — the request
 * is marked consumed in the same write, so a session can't be issued twice.
 */
export function redeemLoginRequest(id: string, secret: string): LoginOutcome {
  return update((store) => {
    const request = store.loginRequests.find((r) => r.id === id);
    if (!request || request.secretHash !== hash(secret)) return "unknown";
    if (request.status === "approved") {
      request.status = "consumed";
      return "approved";
    }
    if (request.status === "pending" && !isLive(request.expiresAt)) return "expired";
    return request.status;
  });
}

export type PublicLoginRequest = Pick<
  LoginRequest,
  "id" | "options" | "createdAt" | "expiresAt" | "userAgent" | "ip"
>;

/** What an unlocked authenticator sees — the options, never which one is right. */
export function getPendingRequests(): PublicLoginRequest[] {
  return read()
    .loginRequests.filter((r) => r.status === "pending" && isLive(r.expiresAt))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ id, options, createdAt, expiresAt, userAgent, ip }) => ({
      id,
      options,
      createdAt,
      expiresAt,
      userAgent,
      ip,
    }));
}

/** One answer per request: the right number approves it, anything else denies it. */
export function answerLoginRequest(
  id: string,
  choice: number | "deny"
): "approved" | "denied" | "gone" {
  return update((store) => {
    const request = store.loginRequests.find(
      (r) => r.id === id && r.status === "pending" && isLive(r.expiresAt)
    );
    if (!request) return "gone";
    request.status = choice === request.number ? "approved" : "denied";
    return request.status;
  });
}
