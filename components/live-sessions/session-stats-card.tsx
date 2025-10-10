import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SessionStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export function SessionStatsCard({
  title,
  value,
  icon: Icon,
}: SessionStatsCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-card-foreground">{value}</p>
        </div>
        <Icon className="h-10 w-10 text-primary" />
      </CardContent>
    </Card>
  );
}
