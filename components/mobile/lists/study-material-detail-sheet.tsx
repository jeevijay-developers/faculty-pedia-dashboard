"use client";

import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailRow, DetailSheet } from "@/components/mobile/lists/detail-sheet";

interface StudyMaterialDocLike {
  _id: string;
  name: string;
  originalName: string;
  fileType: string;
  url: string;
  sizeInBytes: number;
}

interface StudyMaterialLike {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  docs: StudyMaterialDocLike[];
}

const formatFileSize = (size?: number) => {
  if (typeof size !== "number" || Number.isNaN(size)) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  const digits = currentSize >= 10 || unitIndex === 0 ? 0 : 1;
  return `${currentSize.toFixed(digits)} ${units[unitIndex]}`;
};

export function StudyMaterialDetailSheet({
  material,
  open,
  onOpenChange,
  scopeLabel,
  createdLabel,
}: {
  material: StudyMaterialLike | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scopeLabel: string;
  createdLabel: string;
}) {
  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Study Material Details"
      side="full"
    >
      {material && (
        <>
          <DetailRow label="Title">
            <span className="font-medium">{material.title}</span>
          </DetailRow>

          {material.description && (
            <DetailRow label="Description">
              <span className="whitespace-pre-wrap text-muted-foreground">
                {material.description}
              </span>
            </DetailRow>
          )}

          <DetailRow label="Scope">{scopeLabel}</DetailRow>

          <DetailRow label="Created">{createdLabel}</DetailRow>

          <DetailRow label="Subject">
            {material.tags && material.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {material.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">No tags added</span>
            )}
          </DetailRow>

          <DetailRow label="Documents">
            {material.docs && material.docs.length > 0 ? (
              <div className="space-y-2">
                {material.docs.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">
                        {doc.originalName || doc.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {doc.fileType} • {formatFileSize(doc.sizeInBytes)}
                      </span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0"
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download ${doc.originalName || doc.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">No documents attached</span>
            )}
          </DetailRow>
        </>
      )}
    </DetailSheet>
  );
}
