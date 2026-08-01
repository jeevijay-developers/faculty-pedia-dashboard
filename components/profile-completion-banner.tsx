"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ChevronDown, X } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { getProfileCompletion } from "@/lib/profile-completion";

const DISMISS_KEY = "profile-completion-dismissed";

export function ProfileCompletionBanner() {
  const { educator } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!educator || isDismissed) return null;

  const { percent, missing } = getProfileCompletion(educator);
  if (percent >= 100 || missing.length === 0) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setIsDismissed(true);
  };

  return (
    <div className="rounded-lg border border-amber-400/40 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
            aria-expanded={isExpanded}
          >
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-semibold">
                Your profile is {percent}% complete
              </p>
              <div className="h-1.5 w-full max-w-xs rounded-full bg-amber-200/60 dark:bg-amber-900/50">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300 motion-reduce:transition-none"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isExpanded && (
            <ul className="space-y-1.5 pt-1">
              {missing.map((field) => (
                <li key={field.key}>
                  <Link
                    href={`/dashboard?tab=${field.tabTarget}`}
                    className="group flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-amber-900 transition-colors hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40"
                  >
                    <span>{field.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss for this session"
          className="cursor-pointer text-amber-700/70 transition-colors hover:text-amber-900 dark:text-amber-300/70 dark:hover:text-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
