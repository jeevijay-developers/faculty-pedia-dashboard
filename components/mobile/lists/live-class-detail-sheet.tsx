"use client";

import {
  DetailGrid,
  DetailRow,
  DetailSheet,
} from "@/components/mobile/lists/detail-sheet";

export interface LiveClassDetailValues {
  title: string;
  subject: string;
  specialization: string;
  course: string;
  schedule: string;
  duration: string;
  fee: string;
  maxStudents: string;
  targetClasses: string;
  description?: string;
  liveClassLink?: string;
  recordingURL?: string;
}

export function LiveClassDetailSheet({
  values,
  open,
  onOpenChange,
}: {
  values: LiveClassDetailValues | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Live Class Details"
      side="full"
    >
      {values && (
        <>
          <DetailRow label="Title">
            <span className="font-medium">{values.title}</span>
          </DetailRow>

          <DetailGrid>
            <DetailRow label="Subject">{values.subject}</DetailRow>
            <DetailRow label="Specialization">{values.specialization}</DetailRow>
            <DetailRow label="Course" className="col-span-2">
              {values.course}
            </DetailRow>
            <DetailRow label="Schedule" className="col-span-2">
              {values.schedule}
            </DetailRow>
            <DetailRow label="Duration">{values.duration}</DetailRow>
            <DetailRow label="Fee">{values.fee}</DetailRow>
            <DetailRow label="Max Students">{values.maxStudents}</DetailRow>
            <DetailRow label="Target Classes">{values.targetClasses}</DetailRow>
          </DetailGrid>

          {values.description && (
            <DetailRow label="Description">
              <span className="whitespace-pre-wrap text-muted-foreground">
                {values.description}
              </span>
            </DetailRow>
          )}

          {values.liveClassLink && (
            <DetailRow label="Live Class Link">
              <a
                href={values.liveClassLink}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center rounded-md border px-3 py-2 text-primary active:bg-accent/60"
              >
                <span className="min-w-0 break-all">{values.liveClassLink}</span>
              </a>
            </DetailRow>
          )}

          {values.recordingURL && (
            <DetailRow label="Recording Link">
              <a
                href={values.recordingURL}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center rounded-md border px-3 py-2 text-primary active:bg-accent/60"
              >
                <span className="min-w-0 break-all">{values.recordingURL}</span>
              </a>
            </DetailRow>
          )}
        </>
      )}
    </DetailSheet>
  );
}
