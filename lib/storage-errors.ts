import { NextResponse } from "next/server";

/**
 * Turns a storage/database failure into a message that says what to fix,
 * without leaking the connection string or credentials.
 */
export function describeStorageError(error: unknown): string {
  const e = error as { code?: string; message?: string };
  const message = e?.message ?? "";
  const code = e?.code ?? "";

  if (message.includes("DATABASE_URL is not configured")) {
    return "Database not configured: add DATABASE_URL in Vercel → Settings → Environment Variables, then redeploy.";
  }
  if (code === "28P01" || /password authentication failed/i.test(message)) {
    return "Database rejected the password in DATABASE_URL. Check it (no [brackets]) and redeploy.";
  }
  if (/tenant or user not found/i.test(message)) {
    return "Database user not found: use the Supabase “Transaction pooler” connection string (user looks like postgres.<project-ref>).";
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return "Database host not found: check the host in DATABASE_URL (use the Supabase Transaction pooler string).";
  }
  if (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "CONNECT_TIMEOUT" ||
    code === "ENETUNREACH"
  ) {
    return "Couldn't reach the database: use the Supabase “Transaction pooler” string (port 6543), not the direct connection.";
  }
  if (/invalid url|invalid connection string/i.test(message)) {
    return "DATABASE_URL isn't a valid connection string — copy it again from Supabase → Connect.";
  }
  return "The server couldn't reach its database. Check DATABASE_URL in Vercel and redeploy.";
}

type Handler<A extends unknown[]> = (...args: A) => Promise<Response>;

/** Wraps a route handler so storage failures return JSON with a useful message. */
export function withStorageErrors<A extends unknown[]>(
  handler: Handler<A>
): Handler<A> {
  return async (...args: A) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[storage]", error);
      return NextResponse.json(
        { error: describeStorageError(error) },
        { status: 500 }
      );
    }
  };
}
