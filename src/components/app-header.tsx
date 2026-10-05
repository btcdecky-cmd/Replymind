import { Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Logo } from "./logo";
import { Skeleton } from "./ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AppHeader() {
  const { user, isPending } = useCurrentUserState();
  const live = useCurrentUser();
  const display = live ?? user;
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md safe-top">
      <Logo to="/app" />
      <Link
        to="/settings"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-2"
        aria-label="Open settings"
      >
        {isPending ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : display?.profileImageUrl ? (
          <img src={display.profileImageUrl} alt="" className="h-10 w-10 object-cover" />
        ) : (
          <span className="text-sm font-medium">
            {(display?.displayName ?? display?.primaryEmail ?? "Y").charAt(0).toUpperCase()}
          </span>
        )}
      </Link>
    </header>
  );
}
