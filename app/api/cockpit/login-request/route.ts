import { withStorageErrors } from "@/lib/storage-errors";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/admin-auth";
import {
  createLoginRequest,
  hasDevices,
  LOGIN_REQUEST_TTL_MS,
  redeemLoginRequest,
} from "@/lib/authenticator";

// Ties a login request to the browser that started it, so approving on the
// phone only ever logs in *this* browser.
const LOGIN_REQUEST_COOKIE = "bluvig_login_request";
const COOKIE_PATH = "/api/cockpit/login-request";

/** Start a sign-in: returns the number to look for on the authenticator. */
export const POST = withStorageErrors(async (request: Request) => {
  if (!(await hasDevices())) {
    return NextResponse.json(
      { error: "no-devices", message: "No authenticator is set up yet." },
      { status: 409 }
    );
  }

  const cookieStore = await cookies();
  const [previousId, previousSecret] = (
    cookieStore.get(LOGIN_REQUEST_COOKIE)?.value ?? ""
  ).split(".");

  const created = await createLoginRequest({
    userAgent: request.headers.get("user-agent") ?? "Unknown browser",
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown",
    replaces:
      previousId && previousSecret
        ? { id: previousId, secret: previousSecret }
        : undefined,
  });
  if (!created) {
    return NextResponse.json(
      {
        error: "busy",
        message: "Too many sign-in requests waiting. Try again in two minutes.",
      },
      { status: 429 }
    );
  }

  cookieStore.set(
    LOGIN_REQUEST_COOKIE,
    `${created.request.id}.${created.secret}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: COOKIE_PATH,
      maxAge: Math.ceil(LOGIN_REQUEST_TTL_MS / 1000) + 60,
    }
  );

  return NextResponse.json({
    number: created.request.number,
    expiresAt: created.request.expiresAt,
  });
});

/** Polled by the login page. Issues the cockpit session once the phone approves. */
export const GET = withStorageErrors(async () => {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOGIN_REQUEST_COOKIE)?.value ?? "";
  const [id, secret] = value.split(".");
  if (!id || !secret) return NextResponse.json({ status: "unknown" });

  const status = await redeemLoginRequest(id, secret);

  if (status === "approved") {
    cookieStore.delete({ name: LOGIN_REQUEST_COOKIE, path: COOKIE_PATH });
    cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
  }

  return NextResponse.json({ status });
});
