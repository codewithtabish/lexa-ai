// src/proxy.ts

import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ============================================
// ROUTE CONFIGURATION
// ============================================

// Public routes — anyone (logged in or out) can access
const PUBLIC_ROUTES = [
  "/about",
  "/features",
  "/pricing",
  "/faq",
  "/contact",
  "/careers",
  "/privacy",
  "/terms",
  "/refund",
  "/cookies",
  "/gallery",
  "/how-it-works",
  "/blog",
];

// User app routes — only for logged-in users (regular users)
const APP_PREFIXES = ["/app"];

// Admin-only routes — require role === "ADMIN"
const ADMIN_PREFIXES = ["/dashboard", "/agent"];

// Webhook routes — bypass auth entirely
const WEBHOOK_PREFIXES = ["/api/webhooks", "/api/trpc"];

// ============================================
// HELPERS
// ============================================

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// ============================================
// MIDDLEWARE
// ============================================

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  const isLoggedIn = !!userId;
  const isLandingPage = pathname === "/";
  const isPublicRoute = matchesPrefix(pathname, PUBLIC_ROUTES);
  const isWebhookRoute = matchesPrefix(pathname, WEBHOOK_PREFIXES);
  const isAppRoute = matchesPrefix(pathname, APP_PREFIXES);
  const isAdminRoute = matchesPrefix(pathname, ADMIN_PREFIXES);

  // -------------------------------------------------
  // 0. WEBHOOKS — always allow, no auth check
  // -------------------------------------------------
  if (isWebhookRoute) {
    return NextResponse.next();
  }

  // -------------------------------------------------
  // 1. LOGGED-IN USERS CANNOT ACCESS THE LANDING PAGE
  //    Redirect them straight to their app.
  // -------------------------------------------------
  if (isLandingPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // -------------------------------------------------
  // 2. NON-LOGGED-IN USERS CANNOT ACCESS THE APP
  //    Redirect them to sign-in (Clerk modal).
  // -------------------------------------------------
  if (isAppRoute && !isLoggedIn) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // -------------------------------------------------
  // 3. NON-LOGGED-IN USERS CANNOT ACCESS ADMIN ROUTES
  //    Redirect them to sign-in.
  // -------------------------------------------------
  if (isAdminRoute && !isLoggedIn) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // -------------------------------------------------
  // 4. ADMIN ROUTES — require role === "ADMIN"
  // -------------------------------------------------
  if (isAdminRoute && isLoggedIn) {
    let role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;

    // Fallback: if the custom session claim isn't set up yet,
    // hit Clerk's API directly so it doesn't silently fail.
    if (!role && userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = (user.publicMetadata as { role?: string } | undefined)?.role;
    }

    if (role !== "ADMIN") {
      // Non-admin users get bounced back to their app.
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  // -------------------------------------------------
  // 5. EVERYTHING ELSE — allow
  // -------------------------------------------------
  return NextResponse.next();
});

// ============================================
// MATCHER — run on all routes except static assets
// ============================================

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};