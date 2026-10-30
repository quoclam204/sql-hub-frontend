import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const STATE_COOKIE_NAME = "github-oauth-state";
const STATE_COOKIE_PATH = "/api/auth/github";
const MESSAGE_TYPE = "sqlhub:github-oauth";

type CallbackPayload = {
  accessToken?: string;
  error?: string;
};

function renderResultPage(payload: CallbackPayload, secure: boolean) {
  const serializedPayload = JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>GitHub sign-in</title>
  </head>
  <body>
    <p id="message">Completing GitHub sign-in...</p>
    <script>
      (function () {
        var payload = ${serializedPayload};
        if (window.opener) {
          window.opener.postMessage(
            Object.assign({ type: "${MESSAGE_TYPE}" }, payload),
            window.location.origin
          );
        } else {
          document.getElementById("message").textContent =
            "You can close this window and return to SQL Hub.";
        }
        window.close();
      })();
    </script>
  </body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });

  response.cookies.set(STATE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: STATE_COOKIE_PATH,
    maxAge: 0,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const isSecure = requestUrl.protocol === "https:";
  const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value;
  const state = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");

  if (oauthError || !code || !state || state !== storedState) {
    return renderResultPage({ error: oauthError ?? "invalid_state" }, isSecure);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return renderResultPage({ error: "not_configured" }, isSecure);
  }

  try {
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: new URL(
          "/api/auth/github/callback",
          requestUrl.origin
        ).toString(),
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      return renderResultPage({ error: "token_exchange_failed" }, isSecure);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      return renderResultPage({ error: "access_denied" }, isSecure);
    }

    return renderResultPage({ accessToken: tokenData.access_token }, isSecure);
  } catch {
    return renderResultPage({ error: "token_exchange_failed" }, isSecure);
  }
}
