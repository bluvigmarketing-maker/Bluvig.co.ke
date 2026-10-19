import { randomUUID } from "node:crypto";

import type { Attribution } from "@/lib/funnel-events";
import type { Materials } from "@/lib/materials";
import type { PipelineStatus } from "@/lib/pipeline";
import type { Qualification } from "@/lib/qualify";
import { readDoc, updateDoc } from "@/lib/storage";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  goal: string;
  budget: string;
  message: string;
  submittedAt: string;
  /**
   * "callback" = Get Started wizard (websites); "system" = app or business
   * system brief, for a discovery call; absent on leads from the old form.
   */
  kind?: "callback" | "system";
  industry?: string;
  location?: "kenya" | "international";
  budgetBand?: string;
  timeline?: string;
  bestTime?: string;
  materials?: Materials;
  qualification?: Qualification;
  /** Sales pipeline; absent on older leads (treated as "new"). */
  status?: PipelineStatus;
  /** Owner's private note, e.g. "Called Tue, wants a demo". */
  note?: string;
  /** Where the visitor came from (UTM / referrer). */
  source?: Attribution;
}

export type NewLead = Omit<Lead, "id" | "submittedAt" | "status" | "note">;

const KEY = "leads";

export async function addLead(input: NewLead): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  await updateDoc<Lead[], void>(KEY, [], (leads) => {
    leads.push(lead);
  });
  return lead;
}

/** Updates a lead's pipeline status and/or note. False if not found. */
export async function updateLead(
  id: string,
  change: { status?: PipelineStatus; note?: string }
): Promise<boolean> {
  return updateDoc<Lead[], boolean>(KEY, [], (leads) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return false;
    if (change.status) lead.status = change.status;
    if (change.note !== undefined) lead.note = change.note;
    return true;
  });
}

export async function getLeads(): Promise<Lead[]> {
  const leads = await readDoc<Lead[]>(KEY, []);
  return leads.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}
