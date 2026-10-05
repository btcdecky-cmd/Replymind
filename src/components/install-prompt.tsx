import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./ui/button";

type BeforeInstall = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstall | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("replymind-install-dismissed");
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstall);
      if (!dismissed) setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || !event) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-float)]">
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-4 w-4 text-muted" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Install ReplyMind</p>
          <p className="text-xs text-muted">Add it to your home screen for a faster, private reply pad.</p>
        </div>
        <button
          type="button"
          className="rounded-sm p-1 text-muted"
          aria-label="Dismiss install prompt"
          onClick={() => {
            sessionStorage.setItem("replymind-install-dismissed", "1");
            setHidden(true);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Button
        className="mt-3 w-full"
        size="sm"
        onClick={async () => {
          await event.prompt();
          setHidden(true);
        }}
      >
        Install
      </Button>
    </div>
  );
}
