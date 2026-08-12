"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { MORE_SECTIONS } from "@/lib/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * The overflow drawer behind the bottom bar's "More" tab.
 *
 * It carries everything that did not earn a tab slot, plus the profile block
 * and Logout action that live in `components/dashboard-sidebar.tsx` — the
 * sidebar is `hidden` below 768px, so without this sheet logout would be
 * unreachable on a phone.
 */

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Shared row geometry. min-h-12 keeps every target comfortably over 44px. */
const rowClass =
  "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const pathname = usePathname();
  const { educator, logout, getFullName } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  // Explicit user toggles only; anything absent falls back to "open if a child
  // is the current route", so the sheet opens showing where you already are.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getInitials = () => {
    if (!educator) return "E";
    const name = educator.fullName || educator.username || "Educator";
    const [first = "E", second = ""] = name.split(" ").filter(Boolean);
    const initials = `${first.charAt(0)}${second.charAt(0)}`.trim();
    return initials ? initials.toUpperCase() : first.charAt(0).toUpperCase();
  };

  const getProfileImage = () => {
    return educator?.profilePicture || educator?.image?.url || null;
  };

  const profileImage = getProfileImage();

  const closeSheet = () => onOpenChange(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <SheetHeader>
            {profileImage ? (
              <Image
                src={profileImage}
                alt={getFullName()}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-medium text-primary-foreground">
                  {getInitials()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{getFullName()}</SheetTitle>
              <p className="truncate text-xs text-muted-foreground">
                {educator?.email || "educator@example.com"}
              </p>
            </div>
          </SheetHeader>

          <SheetBody className="px-2">
            <nav aria-label="More" className="space-y-1">
              {MORE_SECTIONS.map((section) => {
                const Icon = section.icon;

                if (section.submenu) {
                  const hasActiveChild = section.submenu.some(
                    (sub) => pathname === sub.href
                  );
                  const isExpanded = expanded[section.name] ?? hasActiveChild;

                  return (
                    <div key={section.name}>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [section.name]: !isExpanded,
                          }))
                        }
                        className={cn(
                          rowClass,
                          "text-foreground active:bg-accent"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="flex-1 text-left">{section.name}</span>
                        {isExpanded ? (
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                          {section.submenu.map((sub) => {
                            const isActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={closeSheet}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                  rowClass,
                                  isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground active:bg-accent"
                                )}
                              >
                                <span>{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                if (!section.href) return null;
                const isActive = pathname.startsWith(section.href);

                return (
                  <Link
                    key={section.name}
                    href={section.href}
                    onClick={closeSheet}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      rowClass,
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground active:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-left">{section.name}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetBody>

          <SheetFooter>
            <Button
              onClick={() => setShowLogoutDialog(true)}
              variant="outline"
              className="h-11 w-full justify-center gap-2 border-destructive/30 text-destructive active:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Logout</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog — same pattern as the desktop sidebar. */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You&apos;ll need to sign in again
              to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
