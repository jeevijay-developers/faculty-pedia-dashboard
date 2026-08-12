"use client";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  children,
}: DashboardHeaderProps) {
  const { educator } = useAuth();
  const isInactive =
    educator?.status && educator.status.toLowerCase() !== "active";

  // Below md the MobileTopBar already renders the page title, so this header
  // only earns its space when it has actions or the inactive alert to show.
  const hasMobileContent = Boolean(children) || Boolean(isInactive);

  return (
    <header
      className={cn(
        "relative flex-col gap-3 border-b border-border bg-card px-4 py-3 md:flex md:px-6 md:py-4",
        hasMobileContent ? "flex" : "hidden"
      )}
    >
      {isInactive && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Profile inactive</p>
            <p className="text-sm text-destructive/90">
              Super Admin has inactivated your profile. You cannot create or
              publish new content until reactivated.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-stretch gap-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-0">
        {/* Duplicate of the MobileTopBar title below md — desktop only. */}
        <div className="hidden flex-col md:flex">
          <h1 className="text-xl font-semibold text-card-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
