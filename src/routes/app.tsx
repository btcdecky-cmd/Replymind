import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";
import { Protected } from "@/components/protected";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  return (
    <Protected>
      <div className="min-h-dvh bg-bg text-fg">
        <AppHeader />
        <Outlet />
        <InstallPrompt />
        <BottomNav />
      </div>
    </Protected>
  );
}
