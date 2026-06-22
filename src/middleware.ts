import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

function detectLocale(req: NextRequest): string {
  const header = req.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
    for (const code of preferred) {
      if ((locales as readonly string[]).includes(code)) return code;
    }
  }
  return defaultLocale;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin: protección por JWT (excepto la página de login) ---
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname !== "/admin/login") {
      const ok = await verifyToken(req.cookies.get(AUTH_COOKIE)?.value);
      if (!ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // --- Público: routing de idioma ---
  const current = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (current) {
    // Propaga el locale al root layout para <html lang>.
    const headers = new Headers(req.headers);
    headers.set("x-locale", current);
    return NextResponse.next({ request: { headers } });
  }

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Excluye _next, api y archivos con extensión (imágenes, etc.).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
