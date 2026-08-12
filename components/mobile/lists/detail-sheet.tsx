"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Shared shell for the mobile record detail sheets.
 *
 * These render only from the `md:hidden` card lists — the desktop tables keep
 * their existing view dialogs untouched.
 */

export interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** `bottom` for short records, `full` for anything with a long body. */
  side?: "bottom" | "full";
  children: React.ReactNode;
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  side = "full",
  children,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} aria-describedby={undefined}>
        <SheetHeader>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-ml-2 h-11 w-11 shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
          <SheetTitle className="min-w-0 flex-1 truncate">{title}</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-5 pb-safe">{children}</SheetBody>
      </SheetContent>
    </Sheet>
  );
}

/** One label/value row inside a detail sheet. */
export function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="min-w-0 break-words text-sm text-foreground">{children}</div>
    </div>
  );
}

/** Two-up definition list for compact facts (duration, fee, counts…). */
export function DetailGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-4", className)}>
      {children}
    </div>
  );
}
