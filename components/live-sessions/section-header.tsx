import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function SectionHeader({
  title,
  description,
  buttonText,
  onButtonClick,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button onClick={onButtonClick} className="gap-2">
        <Plus className="h-4 w-4" />
        {buttonText}
      </Button>
    </div>
  );
}
