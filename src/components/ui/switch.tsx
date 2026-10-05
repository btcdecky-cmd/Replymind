import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-2 transition-colors",
        "data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-surface shadow-sm transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-primary-fg" />
    </SwitchPrimitive.Root>
  );
}
