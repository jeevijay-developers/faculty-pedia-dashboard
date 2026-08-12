"use client";

import { Link2 } from "lucide-react";

import { DetailRow, DetailSheet } from "@/components/mobile/lists/detail-sheet";

interface VideoLike {
  _id: string;
  title: string;
  links?: string[];
}

export function VideoDetailSheet({
  video,
  open,
  onOpenChange,
  scopeLabel,
  courseLabel,
  createdLabel,
}: {
  video: VideoLike | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scopeLabel: string;
  courseLabel: string;
  createdLabel: string;
}) {
  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Video Details"
      side="full"
    >
      {video && (
        <>
          <DetailRow label="Title">
            <span className="font-medium">{video.title}</span>
          </DetailRow>

          <DetailRow label="Scope">{scopeLabel}</DetailRow>

          <DetailRow label="Course">{courseLabel}</DetailRow>

          <DetailRow label="Video Links">
            {video.links && video.links.length > 0 ? (
              <div className="space-y-2">
                {video.links.map((link, index) => (
                  <a
                    key={`${video._id}-sheet-link-${index}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm text-primary active:bg-accent/60"
                  >
                    <Link2 className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-all">{link}</span>
                  </a>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">No links added</span>
            )}
          </DetailRow>

          <DetailRow label="Created">{createdLabel}</DetailRow>
        </>
      )}
    </DetailSheet>
  );
}
