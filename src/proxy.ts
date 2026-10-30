import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import {
  fallbackLanguage,
  languages,
  cookieName,
} from "./services/i18n/config";

acceptLanguage.languages([...languages]);

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("/api/") ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  let language;
  if (req.cookies.has(cookieName))
    language = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  if (!language)
    language = acceptLanguage.get(req.headers.get("Accept-Language"));
  if (!language) language = fallbackLanguage;

  // Redirect if language in path is not supported
  if (!languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`))) {
    return NextResponse.redirect(
      new URL(
        `/${language}${req.nextUrl.pathname}${req.nextUrl.search}`,
        req.url
      )
    );
  }

  const languageInPath = languages.find((loc) =>
    req.nextUrl.pathname.startsWith(`/${loc}`)
  );

  const response = NextResponse.next();
  if (languageInPath && req.cookies.get(cookieName)?.value !== languageInPath) {
    response.cookies.set(cookieName, languageInPath);
  }

  return response;
}
