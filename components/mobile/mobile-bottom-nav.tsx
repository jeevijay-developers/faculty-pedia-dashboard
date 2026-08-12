"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { MOBILE_TABS, MORE_TAB, resolveActiveTab } from "@/lib/navigation";
import { MoreSheet } from "@/components/mobile/more-sheet";

/**
 * The native-app bottom tab bar. Below 768px only — `md:hidden` takes it out
 * of the desktop UI entirely, and the desktop sidebar remains the sole nav.
 *
 * Height comes from `--mobile-nav-height`, the same variable `.pb-mobile-nav`
 * uses to keep page content clear of this fixed bar.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const activeTab = resolveActiveTab(pathname);
  const MoreIcon = MORE_TAB.icon;
  const isMoreActive = activeTab === MORE_TAB.id;

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-safe md:hidden"
      >
        <div className="flex h-[var(--mobile-nav-height)] items-stretch">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 transition-transform active:scale-95",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-none">
                  {tab.name}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 transition-transform active:scale-95",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">
              {MORE_TAB.name}
            </span>
          </button>
        </div>
      </nav>

      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
