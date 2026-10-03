import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

/**
 * Tiny document store: one JSON document per key.
 *
 * - With DATABASE_URL set (Supabase/any Postgres): rows in `bluvig_documents`,
 *   updated inside a transaction with a row lock so concurrent requests can't
 *   overwrite each other.
 * - Without it (local dev): `data/<key>.json` files, as before.
 *
 * Fine for small, low-write data (leads, authenticator devices). The estimator's
 * records will get proper tables when that's built.
 */

type Sql = ReturnType<typeof postgres>;

let client: Sql | null = null;
let ready: Promise<unknown> | null = null;

function database(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.VERCEL) {
      throw new Error(
        "DATABASE_URL is not configured — this deployment can't store data. Add it in Vercel → Settings → Environment Variables."
      );
    }
    return null;
  }
  if (!client) {
    client = postgres(url, {
      // Supabase's pooler (port 6543) runs in transaction mode: no prepared statements.
      prepare: false,
      ssl: /@(localhost|127\.0\.0\.1)[:/]/.test(url) ? false : "require",
      max: 3,
      idle_timeout: 20,
    });
    // RLS on with no policies: Supabase's public REST API can't read these rows;
    // only this server's direct database connection can.
    ready = client
      .unsafe(
        `
        create table if not exists bluvig_documents (
          key text primary key,
          value jsonb not null,
          updated_at timestamptz not null default now()
        );
        alter table bluvig_documents enable row level security;
      `
      )
      .catch((error) => {
        // Don't cache a failed setup (e.g. wrong password) — retry on the next request.
        client = null;
        ready = null;
        throw error;
      });
  }
  return client;
}

const DATA_DIR = path.join(process.cwd(), "data");
const fileFor = (key: string) => path.join(DATA_DIR, `${key}.json`);

function readFile<T>(key: string, empty: T): T {
  const file = fileFor(key);
  if (!existsSync(file)) return empty;
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return empty;
  }
}

function writeFile<T>(key: string, value: T) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(fileFor(key), JSON.stringify(value, null, 2), "utf-8");
}

export async function readDoc<T>(key: string, empty: T): Promise<T> {
  const sql = database();
  if (!sql) return readFile(key, empty);
  await ready;
  const rows = await sql<
    { value: T }[]
  >`select value from bluvig_documents where key = ${key}`;
  return rows[0]?.value ?? empty;
}

/** Read-modify-write. `fn` may mutate the document; its return value is passed through. */
export async function updateDoc<T, R>(
  key: string,
  empty: T,
  fn: (doc: T) => R
): Promise<R> {
  const sql = database();
  if (!sql) {
    const doc = readFile(key, empty);
    const result = fn(doc);
    writeFile(key, doc);
    return result;
  }
  await ready;
  return sql.begin(async (tx) => {
    await tx`
      insert into bluvig_documents (key, value)
      values (${key}, ${tx.json(empty as postgres.JSONValue)})
      on conflict (key) do nothing
    `;
    const rows = await tx<{ value: T }[]>`
      select value from bluvig_documents where key = ${key} for update
    `;
    const doc = rows[0].value;
    const result = fn(doc);
    await tx`
      update bluvig_documents
      set value = ${tx.json(doc as postgres.JSONValue)}, updated_at = now()
      where key = ${key}
    `;
    return result;
  }) as Promise<R>;
}
