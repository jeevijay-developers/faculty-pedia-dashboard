"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * The mobile stand-in for one table row.
 *
 * Table pages render `<RecordCardList>` inside a `md:hidden` wrapper and keep
 * their existing `<Table>` inside `hidden md:block`. Desktop is unaffected.
 *
 * Field triage per page: `title` is the identifying column, `meta` holds the
 * two or three columns worth scanning in a list, and everything else belongs
 * in the detail sheet behind `onOpen`.
 */

export interface RecordCardProps {
  title: React.ReactNode;
  /** Short scannable facts. Rendered dot-separated; falsy entries are dropped. */
  meta?: React.ReactNode[];
  /** Status pill or similar, shown top-right. */
  badge?: React.ReactNode;
  /** Thumbnail for records that have one (courses, test series). */
  leading?: React.ReactNode;
  /** Opens the detail sheet. Omit for records with no detail view. */
  onOpen?: () => void;
  /** Row actions, rendered inside an overflow menu. */
  actions?: React.ReactNode;
  className?: string;
}

export function RecordCard({
  title,
  meta,
  badge,
  leading,
  onOpen,
  actions,
  className,
}: RecordCardProps) {
  const visibleMeta = (meta ?? []).filter(Boolean);

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border bg-card px-4 py-3 last:border-b-0",
        onOpen && "active:bg-accent/60 transition-colors",
        className
      )}
    >
      {leading && <div className="shrink-0 pt-0.5">{leading}</div>}

      {/* min-w-0 lets the truncation below actually take effect. */}
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className="flex min-h-11 min-w-0 flex-1 flex-col items-start gap-1 text-left disabled:cursor-default"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <span className="line-clamp-2 text-sm font-medium text-card-foreground">
            {title}
          </span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>

        {visibleMeta.length > 0 && (
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {visibleMeta.map((entry, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-1.5">·</span>}
                {entry}
              </React.Fragment>
            ))}
          </span>
        )}
      </button>

      {actions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 -mr-2"
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{actions}</DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/** Wrapper giving a stack of RecordCards the card chrome the table has. */
export function RecordCardList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-border", className)}>
      {children}
    </div>
  );
}

/** Matches the table's empty-state cell. */
export function RecordCardEmpty({
  icon,
  message,
}: {
  icon?: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      {icon}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Skeleton rows — replaces the spinner while a list loads on mobile. */
export function RecordCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
