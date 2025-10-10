import { PayPerHourCard, type PayPerHour } from "./live-class-card";
import { EmptyState } from "./empty-state";
import { SectionHeader } from "./section-header";
import { Clock, Loader2 } from "lucide-react";

interface PayPerHourTabProps {
  sessions: PayPerHour[];
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (session: PayPerHour) => void;
  onDelete?: (sessionId: string) => void;
}

export function PayPerHourTab({
  sessions,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
}: PayPerHourTabProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading your sessions...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium">Error loading sessions</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No Pay Per Hour sessions"
        description="Create your first pay-per-hour session to offer personalized tutoring."
        buttonText="Create Your First Session"
        onButtonClick={() => {}} // This will be handled by the parent component
      />
    );
  }

  // Sessions display
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sessions.map((session) => (
        <PayPerHourCard
          key={session._id}
          payPerHour={session}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
