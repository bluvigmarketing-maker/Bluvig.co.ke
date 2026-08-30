import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");

function readAll(): Lead[] {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Lead[];
  } catch {
    return [];
  }
}

function writeAll(leads: Lead[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

export function addLead(input: NewLead): Lead {
  const lead: Lead = {
    ...input,
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  const leads = readAll();
  leads.push(lead);
  writeAll(leads);
  return lead;
}

export function getLeads(): Lead[] {
  return readAll().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}
