import { randomUUID } from "node:crypto";

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
