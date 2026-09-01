import { NextRequest, NextResponse } from "next/server";
import { canAccessRoute } from "@/config/route-access";
import { getRole } from "@/config/roles";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

function apiFrontendRoute(pathname: string) {
  if (pathname === "/api/players" || pathname === "/api/players/options") return "/players";
  if (/^\/api\/players\/[^/]+$/.test(pathname)) return "/players/[playerId]";
  if (pathname === "/api/teams") return "/teams";
  if (/^\/api\/teams\/[^/]+$/.test(pathname)) return "/teams/[teamId]";
  if (pathname === "/api/tournaments") return "/tournaments";
  if (/^\/api\/tournaments\/[^/]+$/.test(pathname)) return "/tournaments/[tournamentId]";
  if (pathname === "/api/matches") return "/matches";
  if (/^\/api\/matches\/[^/]+$/.test(pathname)) return "/matches/[matchId]";
  if (pathname === "/api/performance/players") return "/performance/players";
  if (/^\/api\/performance\/players\/[^/]+$/.test(pathname)) return "/performance/players/[playerId]";
  if (pathname === "/api/integrity/complaints") return "/integrity/complaints";
  if (/^\/api\/integrity\/complaints\/[^/]+$/.test(pathname)) return "/integrity/complaints/[complaintId]";
  if (pathname === "/api/integrity/cases") return "/integrity/cases";
  if (/^\/api\/integrity\/cases\/[^/]+$/.test(pathname)) return "/integrity/cases/[caseId]";
  if (pathname === "/api/integrity/rulebook") return "/integrity/rulebook";
  if (/^\/api\/integrity\/rulebook\/[^/]+$/.test(pathname)) return "/integrity/rulebook/[ruleId]";
  return null;
}

function isOwnPlayerRoute(pathname: string, personId: string) {
  const match = pathname.match(/^\/(?:api\/)?(?:performance\/)?players\/([^/]+)(?:\/edit)?$/);
  return !match || match[1] === personId;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const publicApi = pathname.startsWith("/api/auth/") || pathname === "/api/health/database";
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/sign-in" || pathname === "/") {
    if (session) return NextResponse.redirect(new URL(getRole(session.role)?.dashboardRoute ?? "/sign-in", request.url));
    if (pathname === "/") return NextResponse.redirect(new URL("/sign-in", request.url));
    return NextResponse.next();
  }
  if (publicApi) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (pathname === "/api/dashboard") return NextResponse.next();
    const frontendRoute = apiFrontendRoute(pathname);
    if (!frontendRoute || !canAccessRoute(session.role, frontendRoute) || (session.role === "player" && !isOwnPlayerRoute(pathname, session.personId))) return NextResponse.json({ error: "You are not authorized to access this resource." }, { status: 403 });
    return NextResponse.next();
  }

  if (!session) return NextResponse.redirect(new URL("/sign-in", request.url));
  if (!canAccessRoute(session.role, pathname) || (session.role === "player" && !isOwnPlayerRoute(pathname, session.personId))) return NextResponse.redirect(new URL(getRole(session.role)?.dashboardRoute ?? "/sign-in", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
