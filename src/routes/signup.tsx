import { Navigate, createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Skeleton className="h-10 w-40" />
      </main>
    );
  }
  if (user) return <Navigate to="/app" />;
  return <AuthForm mode="signup" />;
}
