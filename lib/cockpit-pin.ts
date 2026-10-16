import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { readDoc, updateDoc } from "@/lib/storage";

/**
 * The owner's 8-digit cockpit PIN — an alternative to passkey sign-in.
 *
 * Stored in the database under key "cockpit-pin" as a salted scrypt hash.
 * Set it from the cockpit, or directly in the database as
 * {"pin": "12345678"}: a plain PIN is hashed (and the plain value removed)
 * the next time anyone tries to sign in.
 */

const KEY = "cockpit-pin";
export const PIN_PATTERN = /^\d{8}$/;

interface PinDoc {
  hash?: string;
  salt?: string;
  updatedAt?: string;
  /** Plain PIN typed straight into the database — replaced by a hash on first use. */
  pin?: string;
}

function hashPin(pin: string, salt: string) {
  return scryptSync(pin, salt, 32).toString("hex");
}

function hashed(pin: string): PinDoc {
  const salt = randomBytes(16).toString("hex");
  return { hash: hashPin(pin, salt), salt, updatedAt: new Date().toISOString() };
}

export async function hasPin(): Promise<boolean> {
  const doc = await readDoc<PinDoc>(KEY, {});
  return Boolean(doc.hash || (doc.pin && PIN_PATTERN.test(doc.pin)));
}

export async function getPinUpdatedAt(): Promise<string | null> {
  return (await readDoc<PinDoc>(KEY, {})).updatedAt ?? null;
}

export async function setPin(pin: string) {
  if (!PIN_PATTERN.test(pin)) throw new Error("The PIN must be exactly 8 digits.");
  await updateDoc<PinDoc, void>(KEY, {}, (doc) => {
    for (const k of Object.keys(doc)) delete doc[k as keyof PinDoc];
    Object.assign(doc, hashed(pin));
  });
}

export async function removePin() {
  await updateDoc<PinDoc, void>(KEY, {}, (doc) => {
    for (const k of Object.keys(doc)) delete doc[k as keyof PinDoc];
  });
}

export async function verifyPin(candidate: string): Promise<boolean> {
  if (!PIN_PATTERN.test(candidate)) return false;
  return updateDoc<PinDoc, boolean>(KEY, {}, (doc) => {
    // A plain PIN set directly in the database: hash it now.
    if (doc.pin !== undefined) {
      const plain = String(doc.pin);
      delete doc.pin;
      if (PIN_PATTERN.test(plain)) Object.assign(doc, hashed(plain));
    }
    if (!doc.hash || !doc.salt) return false;
    const expected = Buffer.from(doc.hash, "hex");
    const actual = Buffer.from(hashPin(candidate, doc.salt), "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  });
}
