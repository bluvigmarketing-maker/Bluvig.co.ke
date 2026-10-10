import { randomBytes } from "node:crypto";

import type { Materials } from "@/lib/materials";
import { readDoc, updateDoc } from "@/lib/storage";
import { MODULES } from "./catalog";
import { newProject, type Project } from "./project";
import {
  buildQuote,
  DEFAULT_SETTINGS,
  type Currency,
  type Pricing,
  type PricingSettings,
  type Quote,
  type Selection,
} from "./pricing";

// ── Pricing (owner-editable) ─────────────────────────────────────────────

interface PriceChange {
  at: string;
  field: string;
  from: number | boolean;
  to: number | boolean;
}

interface PricingDoc {
  settings?: Partial<PricingSettings>;
  modules?: Record<string, { priceKes?: number; enabled?: boolean }>;
  log?: PriceChange[];
}

const PRICING_KEY = "estimator-pricing";

function mergePricing(doc: PricingDoc): Pricing {
  return {
    settings: { ...DEFAULT_SETTINGS, ...doc.settings },
    modules: Object.fromEntries(
      MODULES.map((m) => [
        m.id,
        {
          priceKes: doc.modules?.[m.id]?.priceKes ?? m.defaultPriceKes,
          enabled: doc.modules?.[m.id]?.enabled ?? true,
        },
      ])
    ),
  };
}

export async function getPricing(): Promise<Pricing> {
  return mergePricing(await readDoc<PricingDoc>(PRICING_KEY, {}));
}

export async function getPriceLog(): Promise<PriceChange[]> {
  return ((await readDoc<PricingDoc>(PRICING_KEY, {})).log ?? [])
    .slice(-100)
    .reverse();
}

/** Saves the owner's edits and records every changed value in the log. */
export async function savePricing(next: Pricing): Promise<Pricing> {
  return updateDoc<PricingDoc, Pricing>(PRICING_KEY, {}, (doc) => {
    const current = mergePricing(doc);
    const at = new Date().toISOString();
    const log = (doc.log ??= []);

    for (const key of Object.keys(
      DEFAULT_SETTINGS
    ) as (keyof PricingSettings)[]) {
      if (next.settings[key] !== current.settings[key]) {
        log.push({
          at,
          field: `settings.${key}`,
          from: current.settings[key],
          to: next.settings[key],
        });
      }
    }
    doc.settings = { ...next.settings };

    doc.modules ??= {};
    for (const m of MODULES) {
      const before = current.modules[m.id];
      const after = next.modules[m.id] ?? before;
      if (after.priceKes !== before.priceKes) {
        log.push({
          at,
          field: `${m.id}.price`,
          from: before.priceKes,
          to: after.priceKes,
        });
      }
      if (after.enabled !== before.enabled) {
        log.push({
          at,
          field: `${m.id}.enabled`,
          from: before.enabled,
          to: after.enabled,
        });
      }
      // Store only real overrides, so future default changes still reach
      // modules the owner never touched.
      const override: { priceKes?: number; enabled?: boolean } = {};
      if (after.priceKes !== m.defaultPriceKes)
        override.priceKes = after.priceKes;
      if (!after.enabled) override.enabled = false;
      if (Object.keys(override).length) doc.modules[m.id] = override;
      else delete doc.modules[m.id];
    }
    doc.log = log.slice(-500);
    return mergePricing(doc);
  });
}

// ── Estimates ────────────────────────────────────────────────────────────

export interface EstimateClient {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
}

export type EstimateStatus = "estimate" | "won" | "lost";

export interface Estimate {
  /** Unguessable — used in the shareable order link. */
  token: string;
  /** Human reference printed on documents, e.g. BLV-2026-0007. */
  reference: string;
  createdAt: string;
  industryId: string;
  industryName: string;
  selection: Selection;
  /** Ready-made package chosen, if the selection matches one exactly. */
  packageName?: string;
  /** Prices snapshotted at creation — later price edits never change this. */
  quote: Quote;
  prototype: boolean;
  /** AI chats, inspiration sites and prototype links the client shared. */
  materials?: Materials;
  client: EstimateClient;
  status: EstimateStatus;
  /** Set when the deposit arrives — drives the checklist and client tracker. */
  project?: Project;
}

interface EstimatesDoc {
  counter?: number;
  estimates?: Estimate[];
}

const ESTIMATES_KEY = "estimates";

export async function createEstimate(input: {
  industryId: string;
  industryName: string;
  selection: Selection;
  packageName?: string;
  currency: Currency;
  prototype: boolean;
  /** AI chats, inspiration sites and prototype links the client shared. */
  materials?: Materials;
  client: EstimateClient;
}): Promise<Estimate> {
  const pricing = await getPricing();
  const quote = buildQuote(input.selection, pricing, input.currency);

  return updateDoc<EstimatesDoc, Estimate>(ESTIMATES_KEY, {}, (doc) => {
    doc.counter = (doc.counter ?? 0) + 1;
    const now = new Date();
    const estimate: Estimate = {
      token: randomBytes(12).toString("base64url"),
      reference: `BLV-${now.getFullYear()}-${String(doc.counter).padStart(4, "0")}`,
      createdAt: now.toISOString(),
      industryId: input.industryId,
      industryName: input.industryName,
      selection: input.selection,
      packageName: input.packageName,
      quote,
      prototype: input.prototype,
      materials: input.materials,
      client: input.client,
      status: "estimate",
    };
    (doc.estimates ??= []).push(estimate);
    return estimate;
  });
}

export async function getEstimate(token: string): Promise<Estimate | null> {
  const doc = await readDoc<EstimatesDoc>(ESTIMATES_KEY, {});
  return doc.estimates?.find((e) => e.token === token) ?? null;
}

export async function listEstimates(): Promise<Estimate[]> {
  const doc = await readDoc<EstimatesDoc>(ESTIMATES_KEY, {});
  return [...(doc.estimates ?? [])].reverse();
}

// ── Projects ─────────────────────────────────────────────────────────────

export type ProjectAction =
  | { action: "start" }
  | { action: "task"; taskId: string; done: boolean }
  | { action: "wait"; label: string }
  | { action: "resolve"; waitId: string };

/** Applies one cockpit action to an estimate's project. Returns null if not found. */
export async function updateProject(
  token: string,
  change: ProjectAction
): Promise<Estimate | null> {
  return updateDoc<EstimatesDoc, Estimate | null>(ESTIMATES_KEY, {}, (doc) => {
    const estimate = doc.estimates?.find((e) => e.token === token);
    if (!estimate) return null;
    const now = new Date().toISOString();

    if (change.action === "start") {
      if (!estimate.project) {
        estimate.project = newProject(estimate.selection, estimate.quote);
        estimate.status = "won";
      }
      return estimate;
    }

    const project = estimate.project;
    if (!project) return null;

    if (change.action === "task") {
      const task = project.tasks.find((t) => t.id === change.taskId);
      if (!task) return null;
      task.done = change.done;
      task.doneAt = change.done ? now : undefined;
    } else if (change.action === "wait") {
      project.waits.push({
        id: randomBytes(6).toString("base64url"),
        label: change.label,
        since: now,
      });
    } else if (change.action === "resolve") {
      const wait = project.waits.find((w) => w.id === change.waitId);
      if (wait && !wait.until) wait.until = now;
    }

    const allDone = project.tasks.every((t) => t.done);
    project.launchedAt = allDone ? (project.launchedAt ?? now) : undefined;
    return estimate;
  });
}
