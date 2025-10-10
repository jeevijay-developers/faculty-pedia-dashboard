import { WebinarCard, type Webinar } from "./webinar-card";
import { EmptyState } from "./empty-state";
import { SectionHeader } from "./section-header";
import { Users, Loader2 } from "lucide-react";

interface WebinarsTabProps {
  webinars: Webinar[];
  isLoading?: boolean;
  error?: string | null;
  onCreateWebinar: () => void;
  onEdit?: (webinar: Webinar) => void;
  onDelete?: (webinarId: string) => void;
}

export function WebinarsTab({
  webinars,
  isLoading = false,
  error = null,
  onCreateWebinar,
  onEdit,
  onDelete,
}: WebinarsTabProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading your webinars...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium">Error loading webinars</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (webinars.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No webinars scheduled"
        description="Create your first webinar to engage with a wider audience."
        buttonText="Plan Your First Webinar"
        onButtonClick={onCreateWebinar}
      />
    );
  }

  // Webinars display
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {webinars.map((webinar) => (
        <WebinarCard
          key={webinar._id}
          webinar={webinar}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
