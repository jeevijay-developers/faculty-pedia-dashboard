"use client";

import type React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { MOBILE_TABS, resolvePageTitle } from "@/lib/navigation";

/**
 * The mobile app bar. Below 768px only — `md:hidden` keeps it out of the
 * desktop UI, where `components/dashboard-header.tsx` already owns the title.
 *
 * Tab roots get the brand mark (there is nowhere to go "back" to); every other
 * route gets a back affordance, matching native stack navigation.
 */

interface MobileTopBarProps {
  /** Right-hand slot — icon buttons, a search toggle, etc. */
  actions?: React.ReactNode;
  /** Same slot as `actions`, for callers that prefer JSX children. */
  children?: React.ReactNode;
  className?: string;
}

export function MobileTopBar({
  actions,
  children,
  className,
}: MobileTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const title = resolvePageTitle(pathname);
  const isTabRoot = MOBILE_TABS.some((tab) => tab.href === pathname);
  const trailing = actions ?? children;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 shrink-0 border-b border-border bg-background pt-safe md:hidden",
        className
      )}
    >
      <div className="flex h-14 items-center gap-2 px-2">
        {isTabRoot ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center">
            <Image
              src="/finalLogo.png"
              alt="Facultypedia"
              width={28}
              height={28}
            />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground transition-transform active:scale-95 active:bg-accent"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        )}

        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
          {title}
        </h1>

        {trailing && (
          <div className="flex shrink-0 items-center gap-1">{trailing}</div>
        )}
      </div>
    </header>
  );
}
