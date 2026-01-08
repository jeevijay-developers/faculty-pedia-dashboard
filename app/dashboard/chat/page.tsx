"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Chat" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Chat functionality coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
