import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  live: "border-destructive/30 bg-destructive/10 text-destructive",
  scheduled: "border-primary/30 bg-primary/10 text-primary",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  accepted: "border-green-500/30 bg-green-500/10 text-green-500",
  rejected: "border-red-500/30 bg-red-500/10 text-red-500",
  default: "border-border/60 bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  live: "Live Now",
  scheduled: "Scheduled",
  completed: "Completed",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        statusStyles[status] ?? statusStyles.default
      )}
    >
      {statusLabels[status] ?? "Unknown"}
    </Badge>
  );
}
