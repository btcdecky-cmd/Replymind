import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function AuthSlot({ compact }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }
  if (user) return <UserButton />;
  return (
    <div className="flex items-center gap-2">
      {compact ? null : (
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Log in</Link>
        </Button>
      )}
      <Button size="sm" asChild>
        <Link to="/signup">Try it free</Link>
      </Button>
    </div>
  );
}
