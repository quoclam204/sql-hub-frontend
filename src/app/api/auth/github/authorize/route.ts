import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const STATE_COOKIE_NAME = "github-oauth-state";
const STATE_COOKIE_PATH = "/api/auth/github";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { message: "GitHub OAuth is not configured." },
      { status: 500 }
    );
  }

  const requestUrl = new URL(request.url);
  const redirectUri = new URL(
    "/api/auth/github/callback",
    requestUrl.origin
  ).toString();
  const state = crypto.randomUUID();

  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "read:user user:email");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: requestUrl.protocol === "https:",
    path: STATE_COOKIE_PATH,
    maxAge: 600,
  });

  return response;
}
