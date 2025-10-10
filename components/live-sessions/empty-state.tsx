import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <Card className="border border-dashed border-border/60 bg-muted/10 text-center">
      <CardContent className="space-y-4 py-12">
        <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button onClick={onButtonClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
