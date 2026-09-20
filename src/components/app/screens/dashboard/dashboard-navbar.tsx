// src/components/app/screens/dashboard/navbar/dashboard-navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useClerk,
  UserButton,
  useUser,
  SignUpButton,
} from "@clerk/nextjs";
import {
  Sparkles,
  Zap,
  Sun,
  Moon,
  Menu,
  X,
  Home,
  Wand2,
  History,
  Image as ImageIcon,
  Gem,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { getUserAction, type UserInfo } from "@/actions/users/get-user-action";

// ============================================
// NAV LINKS
// ============================================

const NAV_LINKS = [
  { label: "Home", href: "/app", icon: Home, exact: true },
  { label: "Generate", href: "/app/generate", icon: Wand2 },
  { label: "History", href: "/app/history", icon: History },
  { label: "Gallery", href: "/gallery", icon: ImageIcon },
  { label: "Pricing", href: "/pricing", icon: Gem },
];

// ============================================
// SHIMMER SKELETON
// ============================================

function Shimmer({
  className,
  width = "w-6",
  height = "h-3.5",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "inline-block rounded-full",
        "bg-linear-to-r from-primary/20 via-primary/40 to-primary/20",
        width,
        height,
        className
      )}
    />
  );
}

// ============================================
// 🎯 PUBLIC WRAPPER — Only renders on exact "/app"
// ============================================

export function DashboardNavbar() {
  const pathname = usePathname();

  // 🚫 Hide on every route except exact "/app"
  //    • /app               → ✅ shows
  //    • /app/hair-studio   → ❌ hidden
  //    • /app/age-simulator → ❌ hidden
  //    • /app/history       → ❌ hidden
  //    • /app/generate      → ❌ hidden
  //    • /pricing           → ❌ hidden
  if (pathname !== "/app") {
    return null;
  }

  return <DashboardNavbarContent />;
}

// ============================================
// 🧠 INNER COMPONENT — All the real logic
// ============================================

function DashboardNavbarContent() {
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSignUp } = useClerk();
  const { theme, setTheme } = useTheme();

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      if (!isLoaded || !isSignedIn) {
        setLoadingUser(false);
        return;
      }

      setLoadingUser(true);

      try {
        const result = await getUserAction();
        if (!cancelled && result.success) {
          setUserInfo(result.user);
        }
      } catch (err) {
        console.error("[DashboardNavbar] Failed to fetch user:", err);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isDark = theme === "dark";

  const credits = userInfo?.credits ?? 0;
  const plan = userInfo?.plan ?? "FREE";
  const isFree = plan === "FREE";
  const isPro = plan === "PRO";
  const isBasic = plan === "BASIC";
  const hasPaidPlan = isPro || isBasic;

  const showSkeleton = isSignedIn && loadingUser;

  const isLinkActive = (link: (typeof NAV_LINKS)[number]) => {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full",
          "bg-linear-to-b from-[color-mix(in_oklab,var(--background)_92%,transparent)] via-[color-mix(in_oklab,var(--background)_85%,transparent)] to-[color-mix(in_oklab,var(--background)_78%,transparent)]",
          "dark:from-[color-mix(in_oklab,var(--background)_88%,transparent)] dark:via-[color-mix(in_oklab,var(--background)_80%,transparent)] dark:to-[color-mix(in_oklab,var(--background)_72%,transparent)]",
          "backdrop-blur-xl backdrop-saturate-150",
          "border-b border-[color-mix(in_oklab,var(--primary)_15%,transparent)]",
          "dark:border-[color-mix(in_oklab,var(--primary)_25%,transparent)]",
          "shadow-[0_4px_24px_-8px_color-mix(in_oklab,var(--primary)_15%,transparent)]",
          "dark:shadow-[0_4px_32px_-8px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden",
            "bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]",
            "dark:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]"
          )}
        />

        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Link href="/app" className="group flex shrink-0 items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  "bg-linear-to-br from-primary to-primary/70",
                  "shadow-md shadow-primary/25"
                )}
              >
                <Sparkles className="size-4 text-white" strokeWidth={2.5} />
              </motion.div>
              <span className="text-base font-extrabold tracking-[0.08em] text-foreground">
                LEXA AI
              </span>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3.5 py-2",
                    "text-sm font-medium",
                    "transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="dashboard-nav-underline"
                      className={cn(
                        "absolute inset-x-3 -bottom-px h-0.5 rounded-full",
                        "bg-linear-to-r from-primary to-primary/60"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Credits Badge */}
            {isSignedIn && (
              <motion.div
                whileHover={!showSkeleton ? { scale: 1.02 } : undefined}
                className={cn(
                  "hidden items-center gap-1.5 rounded-full sm:flex",
                  "bg-linear-to-r from-primary/15 to-primary/10",
                  "border border-primary/30",
                  "px-3 py-1.5",
                  "shadow-sm shadow-primary/10"
                )}
              >
                <Zap
                  className={cn("size-3.5 text-primary", showSkeleton && "opacity-50")}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                {showSkeleton ? (
                  <Shimmer width="w-6" height="h-3.5" />
                ) : (
                  <span className="text-[13px] font-bold text-primary">{credits}</span>
                )}
                <span className="text-[11px] font-medium text-primary/70">credits</span>
              </motion.div>
            )}

            {/* Plan Badge / Upgrade */}
            {isSignedIn ? (
              showSkeleton ? (
                <div
                  className={cn(
                    "hidden items-center gap-1.5 rounded-full lg:flex",
                    "bg-linear-to-r from-primary/10 to-primary/5",
                    "border border-primary/20",
                    "px-3 py-1.5"
                  )}
                >
                  <Crown className="size-3.5 text-primary/50" strokeWidth={2.5} fill="currentColor" />
                  <Shimmer width="w-10" height="h-3" />
                </div>
              ) : hasPaidPlan ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "hidden items-center gap-1.5 rounded-full lg:flex",
                    isPro
                      ? "bg-linear-to-r from-amber-500/20 to-amber-400/10 dark:from-amber-500/25 dark:to-amber-400/15"
                      : "bg-linear-to-r from-primary/20 to-primary/10",
                    isPro
                      ? "border border-amber-500/40 dark:border-amber-400/50"
                      : "border border-primary/40",
                    "px-3 py-1.5",
                    "shadow-sm",
                    isPro ? "shadow-amber-500/10" : "shadow-primary/10"
                  )}
                >
                  <Crown
                    className={cn("size-3.5", isPro ? "text-amber-500" : "text-primary")}
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      isPro ? "text-amber-500" : "text-primary"
                    )}
                  >
                    {isPro ? "Pro" : "Basic"}
                  </span>
                </motion.div>
              ) : (
                <Link
                  href="/app/upgrade"
                  className={cn(
                    "hidden items-center gap-1 rounded-full px-3 py-1.5 lg:flex",
                    "text-[13px] font-semibold text-primary",
                    "transition-colors duration-200",
                    "hover:bg-primary/5"
                  )}
                >
                  Upgrade
                </Link>
              )
            ) : null}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                "border border-border/60 bg-card/50 backdrop-blur-sm",
                "text-foreground",
                "transition-all duration-200",
                "hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              )}
            >
              {mounted && isDark ? (
                <Moon className="size-4" strokeWidth={2.5} />
              ) : (
                <Sun className="size-4" strokeWidth={2.5} />
              )}
            </button>

            {/* User Profile / Sign In */}
            {isLoaded && isSignedIn ? (
              <div className="flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: cn(
                        "size-9 rounded-full",
                        "ring-2 ring-primary/20 hover:ring-primary/40",
                        "transition-all duration-200"
                      ),
                      userButtonPopoverCard:
                        "bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl",
                      userButtonPopoverActionButton: "hover:bg-primary/5 text-foreground",
                      userButtonPopoverActionButtonText: "text-sm font-medium",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My Account"
                      labelIcon={<Home className="size-4" />}
                      href="/app"
                    />
                    <UserButton.Link
                      label="Billing"
                      labelIcon={<Gem className="size-4" />}
                      href="/app/billing"
                    />
                    <UserButton.Action label="manageAccount" />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            ) : isLoaded ? (
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className={cn(
                    "h-9 rounded-full px-4",
                    "bg-linear-to-r from-primary to-primary/80",
                    "text-[13px] font-semibold text-primary-foreground",
                    "shadow-md shadow-primary/25",
                    "transition-all duration-200",
                    "hover:shadow-lg hover:shadow-primary/35"
                  )}
                >
                  Sign In
                </button>
              </SignUpButton>
            ) : null}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className={cn(
                "flex size-9 items-center justify-center rounded-full lg:hidden",
                "border border-border/60 bg-card/50 backdrop-blur-sm",
                "text-foreground",
                "transition-colors duration-200",
                "hover:bg-muted/60"
              )}
            >
              {isMobileOpen ? (
                <X className="size-4" strokeWidth={2.5} />
              ) : (
                <Menu className="size-4" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "fixed inset-x-4 top-20 z-50 lg:hidden",
                "rounded-3xl border border-border/60",
                "bg-[color-mix(in_oklab,var(--background)_95%,transparent)]",
                "dark:bg-[color-mix(in_oklab,var(--background)_92%,transparent)]",
                "backdrop-blur-2xl backdrop-saturate-150",
                "p-4",
                "shadow-2xl shadow-[color-mix(in_oklab,var(--primary)_20%,transparent)]",
                "dark:shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
              )}
            >
              {/* Credits + Plan badge (mobile) */}
              <div
                className={cn(
                  "mb-3 flex items-center justify-between rounded-2xl",
                  "bg-linear-to-r from-primary/15 to-primary/5",
                  "border border-primary/25",
                  "px-4 py-3"
                )}
              >
                <div className="flex items-center gap-2">
                  <Zap
                    className={cn("size-4 text-primary", showSkeleton && "opacity-50")}
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                  {showSkeleton ? (
                    <Shimmer width="w-20" height="h-4" />
                  ) : (
                    <span className="text-sm font-bold text-foreground">
                      {credits} credits
                    </span>
                  )}
                </div>

                {showSkeleton ? (
                  <Shimmer width="w-14" height="h-4" />
                ) : hasPaidPlan ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                      "text-[10px] font-bold uppercase tracking-wider",
                      isPro
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : "bg-primary/15 text-primary border border-primary/30"
                    )}
                  >
                    <Crown className="size-2.5" fill="currentColor" strokeWidth={0} />
                    {isPro ? "Pro" : "Basic"}
                  </span>
                ) : (
                  <Link
                    href="/app/upgrade"
                    onClick={() => setIsMobileOpen(false)}
                    className="text-xs font-semibold text-primary"
                  >
                    Upgrade →
                  </Link>
                )}
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = isLinkActive(link);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl px-3.5 py-3",
                        "text-[15px] font-medium",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "size-4",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                          strokeWidth={2.5}
                        />
                        {link.label}
                      </div>
                      <ChevronRight
                        className={cn(
                          "size-4",
                          isActive ? "text-primary" : "text-muted-foreground/60"
                        )}
                        strokeWidth={2.5}
                      />
                    </Link>
                  );
                })}
              </nav>

              <div className="my-3 h-px bg-border/60" />

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {isLoaded && isSignedIn && user && (
                    <>
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "size-9 ring-2 ring-primary/20 rounded-full",
                          },
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-foreground">
                          {user.firstName || user.username || "User"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {user.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label="Toggle theme"
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    "border border-border/60 bg-card/50",
                    "text-foreground"
                  )}
                >
                  {mounted && isDark ? (
                    <Moon className="size-4" strokeWidth={2.5} />
                  ) : (
                    <Sun className="size-4" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}