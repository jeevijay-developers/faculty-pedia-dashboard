"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Mobile-first sheet built on Radix Dialog.
 *
 * This primitive exists for the sub-768px experience: bottom sheets for short
 * confirmations, `side="full"` for long forms that need the whole screen.
 * Desktop keeps using `components/ui/dialog.tsx` — nothing here touches it.
 */

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  cn(
    "fixed z-50 flex flex-col bg-background shadow-lg",
    "transition ease-in-out",
    "data-[state=open]:animate-in data-[state=open]:duration-300",
    "data-[state=closed]:animate-out data-[state=closed]:duration-200"
  ),
  {
    variants: {
      side: {
        // Default mobile affordance: rises from the bottom, capped so the
        // page behind stays visible as an escape hatch.
        bottom:
          "inset-x-0 bottom-0 max-h-[90svh] rounded-t-2xl border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        // Long forms — the 700-1200 line create/edit dialogs.
        full: "inset-0 h-[100svh] w-full data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        top: "inset-x-0 top-0 max-h-[90svh] rounded-b-2xl border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
        left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        right:
          "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /** Show the drag-affordance bar. Defaults on for bottom sheets. */
  showGrabber?: boolean;
  showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { className, children, side = "bottom", showGrabber, showCloseButton, ...props },
    ref
  ) => {
    const withGrabber = showGrabber ?? side === "bottom";

    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          {withGrabber && (
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div
                aria-hidden="true"
                className="h-1.5 w-10 rounded-full bg-muted-foreground/30"
              />
            </div>
          )}
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

/** Sticky header. Pair with SheetBody so only the body scrolls. */
const SheetHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3",
      "pt-[max(0.75rem,env(safe-area-inset-top))]",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

/** The only scrolling region. `overscroll-contain` stops scroll chaining to the page. */
const SheetBody = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex-1 overflow-y-auto overscroll-contain px-4 py-4", className)}
    {...props}
  />
);
SheetBody.displayName = "SheetBody";

/** Sticky footer for primary actions, clear of the iOS home indicator. */
const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "sticky bottom-0 z-10 flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-4 py-3",
      "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-base font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
