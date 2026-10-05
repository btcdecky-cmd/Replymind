import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "bottom" | "right" }) {
  return (
    <SheetPortal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-surface text-fg shadow-[var(--shadow-float)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88vh] rounded-t-xl border-t border-border p-5 safe-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          side === "right" &&
            "inset-y-0 right-0 h-full w-full max-w-md border-l border-border p-5 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-display text-xl text-fg", className)} {...props} />;
}
