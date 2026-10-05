import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteAccountData } from "@/lib/server/account";
import { getPreferences, updatePreferences } from "@/lib/server/preferences";
import { getUsage } from "@/lib/server/usage";
import { TONES, type ToneId } from "@/lib/tones";
import type { UsageSnapshot } from "@/lib/usage/usage-service";
import { PLANS } from "@/lib/usage/plans";
import { friendlyError } from "@/lib/utils";
import { useTheme, type ThemeSetting } from "../theme-provider";
import { ToneIcon } from "../tone-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { isPending } = useCurrentUserState();
  const theme = useTheme();
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [keep, setKeep] = useState(false);
  const [emoji, setEmoji] = useState<"auto" | "always" | "never">("auto");
  const [tone, setTone] = useState<ToneId>("natural");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const gateSession = typeof window !== "undefined" && hasGateSessionMarker();

  useEffect(() => {
    void Promise.all([getPreferences(), getUsage()])
      .then(([prefs, snap]) => {
        setKeep(prefs.keepScreenshots);
        setEmoji(prefs.emojiPreference);
        setTone(prefs.defaultTone);
        setUsage(snap);
        theme.setSetting(prefs.appearance);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveAppearance(next: ThemeSetting) {
    theme.setSetting(next);
    try {
      await updatePreferences({ data: { appearance: next } });
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
      <h1 className="font-display text-3xl">Settings</h1>

      <Card className="mt-6 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Profile</p>
        {isPending ? (
          <p className="mt-2 text-sm text-muted">Loading…</p>
        ) : (
          <>
            <p className="mt-2 font-medium">{user?.displayName ?? "Account"}</p>
            <p className="text-sm text-muted">{user?.primaryEmail}</p>
          </>
        )}
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Appearance</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["system", "light", "dark"] as const).map((opt) => (
            <Button
              key={opt}
              variant={theme.setting === opt ? "default" : "outline"}
              size="sm"
              onClick={() => void saveAppearance(opt)}
            >
              {opt[0].toUpperCase() + opt.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Default tone</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTone(t.id);
                void updatePreferences({ data: { defaultTone: t.id } });
              }}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm ${tone === t.id ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface"}`}
            >
              <ToneIcon icon={t.icon} className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Emoji preference</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["auto", "always", "never"] as const).map((opt) => (
            <Button
              key={opt}
              variant={emoji === opt ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setEmoji(opt);
                void updatePreferences({ data: { emojiPreference: opt } });
              }}
            >
              {opt[0].toUpperCase() + opt.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Privacy</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Keep screenshots</p>
            <p className="text-xs text-muted">Off by default. Images otherwise expire within a day.</p>
          </div>
          <Switch
            checked={keep}
            onCheckedChange={(value) => {
              setKeep(value);
              void updatePreferences({ data: { keepScreenshots: value } });
            }}
            aria-label="Keep screenshots"
          />
        </div>
        <Separator className="my-4" />
        <Link to="/app/history" className="text-sm underline-offset-4 hover:underline">
          Saved conversations
        </Link>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Usage</p>
        {usage ? (
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted">Plan</span>
              <span>{PLANS[usage.plan].label}</span>
            </li>
            <Meter label="Screenshot reads" used={usage.used.analysis} limit={usage.limits.analysis} />
            <Meter label="Reply drafts" used={usage.used.generation} limit={usage.limits.generation} />
            <Meter label="Rewrites" used={usage.used.rewrite} limit={usage.limits.rewrite} />
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Loading usage…</p>
        )}
        <p className="mt-3 text-xs text-muted">Limits are enforced on the server. Premium can be enabled per account.</p>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">About</p>
        <p className="mt-2 text-sm text-muted">
          ReplyMind drafts replies from a screenshot or a pasted thread. It does not speak for you in the live chat.
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <Link to="/privacy" className="underline-offset-4 hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="underline-offset-4 hover:underline">
            Terms
          </Link>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-2">
        {!gateSession ? (
          <Button
            variant="outline"
            onClick={() => {
              void signOut("/").catch(() => toast.error("Could not sign out. Try again."));
            }}
          >
            Sign out
          </Button>
        ) : null}
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete account data
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete everything on this account?</AlertDialogTitle>
          <AlertDialogDescription>
            Conversations, screenshots, replies, and usage history will be removed. This cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteAccountData();
                  toast.success("Account data deleted");
                  if (!gateSession) {
                    await signOut("/");
                  } else {
                    void navigate({ to: "/" });
                  }
                } catch (err) {
                  toast.error(friendlyError(err));
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <li>
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
