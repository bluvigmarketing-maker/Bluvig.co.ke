import { NextResponse } from "next/server";

import { answerLoginRequest, getPendingRequests } from "@/lib/authenticator";
import { getAuthenticatorDevice } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

const locked = () => NextResponse.json({ error: "locked" }, { status: 401 });

/** Pending cockpit sign-ins, as three-number choices. */
export const GET = withStorageErrors(async () => {
  if (!(await getAuthenticatorDevice())) return locked();
  return NextResponse.json({ requests: await getPendingRequests() });
});

/** Answer one request: `choice` is the tapped number, or "deny". */
export const POST = withStorageErrors(async (request: Request) => {
  if (!(await getAuthenticatorDevice())) return locked();

  const { requestId, choice } = (await request.json().catch(() => ({}))) as {
    requestId?: string;
    choice?: number | "deny";
  };
  if (!requestId || (choice !== "deny" && !Number.isInteger(choice))) {
    return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  }

  return NextResponse.json({
    result: await answerLoginRequest(requestId, choice!),
  });
});
