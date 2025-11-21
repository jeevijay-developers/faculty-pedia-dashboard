"use client";

import { DashboardHeader } from "@/components/dashboard-header";

export default function TestPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Test" />
      <div className="flex-1 p-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <p className="text-muted-foreground">
            Test management content will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
