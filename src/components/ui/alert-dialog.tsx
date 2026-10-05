import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 text-fg shadow-[var(--shadow-float)]",
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title className={cn("font-display text-xl", className)} {...props} />;
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description className={cn("mt-2 text-sm text-muted", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-5 flex justify-end gap-2", className)} {...props} />;
}

export const AlertDialogCancel = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>) => (
  <AlertDialogPrimitive.Cancel className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />
);

export const AlertDialogAction = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>) => (
  <AlertDialogPrimitive.Action className={cn(buttonVariants({ variant: "danger" }), className)} {...props} />
);
