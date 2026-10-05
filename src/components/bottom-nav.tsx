import { Link, useRouterState } from "@tanstack/react-router";
import { Clock3, Plus, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/app", label: "Home", icon: Sparkles, match: (p: string) => p === "/app" },
  { to: "/app/compose", label: "New", icon: Plus, match: (p: string) => p.startsWith("/app/compose") },
  { to: "/app/history", label: "History", icon: Clock3, match: (p: string) => p.startsWith("/app/history") },
  { to: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1 safe-bottom">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.2]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
