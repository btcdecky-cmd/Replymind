import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { Protected } from "@/components/protected";
import { SettingsPage } from "@/components/settings/settings-page";

export const Route = createFileRoute("/settings")({ component: SettingsLayout });

function SettingsLayout() {
  return (
    <Protected>
      <div className="min-h-dvh bg-bg text-fg">
        <AppHeader />
        <SettingsPage />
        <BottomNav />
      </div>
    </Protected>
  );
}
