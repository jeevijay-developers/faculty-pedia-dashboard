"use client";

import { type MouseEvent, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  badgeLimit?: number;
  className?: string;
  emptyMessage?: string;
}

export function MultiSelect({
  value = [],
  onChange,
  options,
  placeholder = "Select options",
  badgeLimit = 3,
  className,
  emptyMessage = "No options available",
}: MultiSelectProps) {
  const selectedOptions = useMemo(
    () => options.filter((option) => value?.includes(option.value)),
    [options, value]
  );

  const toggleValue = (optionValue: string) => {
    const currentValue = value || [];
    if (currentValue.includes(optionValue)) {
      onChange(currentValue.filter((item) => item !== optionValue));
    } else {
      onChange([...currentValue, optionValue]);
    }
  };

  const clearAll = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onChange([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-auto min-h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-md border border-dashed border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            !selectedOptions.length && "text-muted-foreground",
            className
          )}
        >
          <span className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
            {selectedOptions.length ? (
              <>
                {selectedOptions.slice(0, badgeLimit).map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="rounded-sm px-2 font-normal shrink-0"
                  >
                    {option.label}
                  </Badge>
                ))}
                {selectedOptions.length > badgeLimit && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-2 font-normal shrink-0"
                  >
                    +{selectedOptions.length - badgeLimit}
                  </Badge>
                )}
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          {selectedOptions.length > 0 ? (
            <X
              className="h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
              onClick={clearAll}
            />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <ScrollArea className="max-h-72">
          {options.length ? (
            <div className="flex flex-col">
              {options.map((option) => {
                const checked = value?.includes(option.value) || false;
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted",
                      checked && "bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleValue(option.value)}
                      className="pointer-events-auto"
                    />
                    <span className="capitalize">{option.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
