"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BroadcastMessageDialog } from "@/components/broadcast-message-dialog";
import { useAuth } from "@/contexts/auth-context";
import { getBroadcastHistory } from "@/util/server";
import {
  AlertTriangle,
  Clock,
  Inbox,
  Loader2,
  Megaphone,
  RefreshCcw,
  Users,
} from "lucide-react";

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  recipientCount: number;
  sentAt: Date;
}

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

const formatRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "1 day ago";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) {
    return "1 week ago";
  }

  if (diffWeeks < 5) {
    return `${diffWeeks} weeks ago`;
  }

  return formatDateTime(date);
};

export default function MessagesPage() {
  const { educator, isLoading } = useAuth();
  const educatorId = educator?._id ?? null;
  const router = useRouter();

  const [history, setHistory] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasOlderRecords, setHasOlderRecords] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!educatorId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasOlderRecords(false);

      const response = await getBroadcastHistory(educatorId, {
        limit: 100,
        page: 1,
      });

      const payload = response as {
        success?: boolean;
        message?: string;
        data?: { broadcasts?: unknown[] };
        broadcasts?: unknown[];
      };

      const rawBroadcasts = Array.isArray(payload?.data?.broadcasts)
        ? payload.data!.broadcasts!
        : Array.isArray(payload?.broadcasts)
        ? payload.broadcasts
        : [];

      const now = Date.now();
      let olderRecordDetected = false;

      const normalized = (rawBroadcasts as Array<Record<string, unknown>>)
        .map((entry) => {
          const sentAtRaw =
            entry?.sentAt ??
            entry?.createdAt ??
            (entry?._id && typeof entry._id === "object"
              ? (entry._id as { createdAt?: string }).createdAt
              : undefined);
          const sentAtDate = sentAtRaw
            ? new Date(sentAtRaw as string | number | Date)
            : null;

          if (!sentAtDate || Number.isNaN(sentAtDate.getTime())) {
            return null;
          }

          const ageMs = now - sentAtDate.getTime();
          if (ageMs > THIRTY_DAYS_IN_MS) {
            olderRecordDetected = true;
            return null;
          }

          const idSource =
            entry?._id ??
            entry?.id ??
            `${entry?.title ?? "broadcast"}-${sentAtDate.getTime()}`;

          return {
            id: String(idSource),
            title: typeof entry?.title === "string" ? entry.title : "Broadcast Message",
            message: typeof entry?.message === "string" ? entry.message : "",
            recipientCount:
              typeof entry?.recipientCount === "number"
                ? entry.recipientCount
                : 0,
            sentAt: sentAtDate,
          } satisfies BroadcastMessage;
        })
        .filter((entry): entry is BroadcastMessage => entry !== null);

      normalized.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

      setHasOlderRecords(olderRecordDetected);
      setHistory(normalized);
    } catch (err: unknown) {
      console.error("Failed to fetch broadcast history:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to load broadcast history.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [educatorId]);

  useEffect(() => {
    if (!isLoading && !educatorId) {
      router.push("/login");
    }
  }, [educatorId, isLoading, router]);

  useEffect(() => {
    if (educatorId) {
      void fetchHistory();
    }
  }, [educatorId, fetchHistory]);

  const totalRecipients = useMemo(
    () => history.reduce((sum, entry) => sum + entry.recipientCount, 0),
    [history]
  );
  const lastSentAt = history.length > 0 ? history[0].sentAt : null;
  const isInitialLoading = loading && history.length === 0 && !error;
  const followerCount = educator?.followers?.length ?? 0;

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader
        title="Messages"
        description="Review broadcast messages sent to your followers."
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              Broadcast History
            </h2>
            <p className="text-sm text-muted-foreground">
              Messages older than 30 days are hidden automatically
              {hasOlderRecords ?
                ". Older broadcasts remain available in your full history." : "."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchHistory()}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
              disabled={!educatorId}
            >
              <Megaphone className="h-4 w-4" />
              Send Message
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Broadcasts (30 days)
                </p>
                <p className="text-2xl font-semibold text-card-foreground">
                  {history.length}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total recipients reached
                </p>
                <p className="text-2xl font-semibold text-card-foreground">
                  {totalRecipients}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Last message</p>
                <p className="text-2xl font-semibold text-card-foreground">
                  {lastSentAt ? formatRelativeTime(lastSentAt) : "—"}
                </p>
                {lastSentAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(lastSentAt)}
                  </p>
                )}
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {error && !isInitialLoading ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Unable to load messages
              </CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                onClick={() => void fetchHistory()}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : isInitialLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div
                key={`message-skeleton-${item}`}
                className="h-28 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 bg-card p-10 text-center">
            <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">
              No broadcasts in the last 30 days
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When you send a message to your followers, it will appear here for
              30 days.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg text-card-foreground">
                        {entry.title}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {entry.recipientCount} {entry.recipientCount === 1 ? "recipient" : "recipients"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <p className="whitespace-pre-line text-sm text-card-foreground sm:max-w-3xl">
                      {entry.message}
                    </p>
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wide">Sent</span>
                        {` | ${formatRelativeTime(entry.sentAt)} | `}
                        <span className="text-[11px] text-muted-foreground/80">
                          {formatDateTime(entry.sentAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {educatorId && (
        <BroadcastMessageDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          educatorId={educatorId}
          followerCount={followerCount}
          onSent={() => {
            void fetchHistory();
          }}
        />
      )}
    </div>
  );
}
