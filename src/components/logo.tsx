import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  to = "/",
  markOnly,
}: {
  className?: string;
  to?: string;
  markOnly?: boolean;
}) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2 text-fg no-underline", className)} aria-label="ReplyMind home">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-fg" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <rect x="3.5" y="5" width="13" height="9" rx="4.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="7.5" y="10.5" width="13" height="8" rx="4" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      {markOnly ? null : <span className="font-display text-lg tracking-tight">ReplyMind</span>}
    </Link>
  );
}
