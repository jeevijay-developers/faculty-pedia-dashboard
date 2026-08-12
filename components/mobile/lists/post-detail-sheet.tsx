"use client";

import { Badge } from "@/components/ui/badge";
import { DetailRow, DetailSheet } from "@/components/mobile/lists/detail-sheet";

export function PostDetailSheet({
  open,
  onOpenChange,
  title,
  description,
  subjects,
  specializations,
  createdLabel,
  formatLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subjects: string[];
  specializations: string[];
  createdLabel: string;
  formatLabel: (value: string) => string;
}) {
  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Post Details"
      side="full"
    >
      <DetailRow label="Title">
        <span className="font-medium">{title}</span>
      </DetailRow>

      <DetailRow label="Description">
        <span className="whitespace-pre-line text-muted-foreground">
          {description}
        </span>
      </DetailRow>

      <DetailRow label="Subjects">
        {subjects.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {subjects.map((subject) => (
              <Badge key={subject} variant="outline">
                {formatLabel(subject)}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </DetailRow>

      <DetailRow label="Exam">
        {specializations.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {specializations.map((specialization) => (
              <Badge key={specialization}>{formatLabel(specialization)}</Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </DetailRow>

      <DetailRow label="Created At">
        <span className="text-muted-foreground">{createdLabel}</span>
      </DetailRow>
    </DetailSheet>
  );
}
