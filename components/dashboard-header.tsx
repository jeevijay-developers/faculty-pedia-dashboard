"use client";

import { AlertCircle } from "lucide-react";

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

  return (
    <header className="relative flex flex-col gap-3 border-b border-border bg-card px-6 py-4">
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

      <div className="flex h-16 items-center justify-between">
        <div className="flex flex-col">
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
