import { normalizeDoc, type InvoiceDoc, type Party } from "./model";

/**
 * Browser-only storage for the invoice generator. Nothing here reaches the
 * server. Every access is wrapped: private windows and full storage simply
 * mean nothing is remembered.
 */

const DRAFT = "bluvig-invoice:draft";
const PROFILE = "bluvig-invoice:profile";
const DOCS = "bluvig-invoice:docs";
const MAX_DOCS = 60;

/** The parts of a document that belong to the business, reused on every new one. */
export type Profile = Pick<
  InvoiceDoc,
  | "from"
  | "branding"
  | "payment"
  | "currency"
  | "decimals"
  | "taxLabel"
  | "taxRate"
  | "taxInclusive"
  | "notes"
  | "terms"
  | "signature"
  | "signatoryName"
  | "signatoryTitle"
  | "showItemNumbers"
  | "showQuantities"
>;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft() {
  return normalizeDoc(read(DRAFT));
}

export function saveDraft(doc: InvoiceDoc) {
  write(DRAFT, doc);
}

export function profileOf(doc: InvoiceDoc): Profile {
  return {
    from: doc.from,
    branding: doc.branding,
    payment: doc.payment,
    currency: doc.currency,
    decimals: doc.decimals,
    taxLabel: doc.taxLabel,
    taxRate: doc.taxRate,
    taxInclusive: doc.taxInclusive,
    notes: doc.notes,
    terms: doc.terms,
    signature: doc.signature,
    signatoryName: doc.signatoryName,
    signatoryTitle: doc.signatoryTitle,
    showItemNumbers: doc.showItemNumbers,
    showQuantities: doc.showQuantities,
  };
}

export function loadProfile() {
  return read<Profile>(PROFILE);
}

export function saveProfile(doc: InvoiceDoc) {
  write(PROFILE, profileOf(doc));
}

/** Saved documents keep their text only; the logo and signature live in the profile. */
export function loadDocs(): InvoiceDoc[] {
  const list = read<unknown[]>(DOCS);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeDoc).filter((d): d is InvoiceDoc => d !== null);
}

export function saveDoc(doc: InvoiceDoc): InvoiceDoc[] {
  const slim: InvoiceDoc = {
    ...doc,
    signature: "",
    branding: { ...doc.branding, logo: "" },
    updatedAt: new Date().toISOString(),
  };
  const docs = [slim, ...loadDocs().filter((d) => d.id !== doc.id)].slice(
    0,
    MAX_DOCS,
  );
  write(DOCS, docs);
  return docs;
}

export function deleteDoc(id: string): InvoiceDoc[] {
  const docs = loadDocs().filter((d) => d.id !== id);
  write(DOCS, docs);
  return docs;
}

/** Past clients, newest first, for the "Bill to" autocomplete. */
export function recentClients(docs: InvoiceDoc[]): Party[] {
  const seen = new Map<string, Party>();
  for (const d of docs) {
    const key = d.to.name.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, d.to);
  }
  return [...seen.values()];
}

/** Past line items, newest first, for the item-name autocomplete. */
export function recentItems(docs: InvoiceDoc[]) {
  const seen = new Map<
    string,
    { name: string; description: string; unit: string; rate: number }
  >();
  for (const d of docs) {
    for (const i of d.items) {
      const key = i.name.trim().toLowerCase();
      if (key && !seen.has(key))
        seen.set(key, {
          name: i.name.trim(),
          description: i.description,
          unit: i.unit,
          rate: i.rate,
        });
    }
  }
  return [...seen.values()];
}
