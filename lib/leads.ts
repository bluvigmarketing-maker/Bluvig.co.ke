import { randomUUID } from "node:crypto";

import type { Materials } from "@/lib/materials";
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
  /** "callback" = Get Started wizard; absent on leads from the old form. */
  kind?: "callback";
  industry?: string;
  location?: "kenya" | "international";
  budgetBand?: string;
  timeline?: string;
  bestTime?: string;
  materials?: Materials;
  qualification?: Qualification;
}

export type NewLead = Omit<Lead, "id" | "submittedAt">;

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

export async function getLeads(): Promise<Lead[]> {
  const leads = await readDoc<Lead[]>(KEY, []);
  return leads.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}
