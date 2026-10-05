import { useNavigate } from "@tanstack/react-router";
import { Archive, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  archiveConversation,
  deleteConversation,
  deleteConversationScreenshot,
  renameConversation,
  type ConversationDetail,
} from "@/lib/server/conversations";
import { regenerateStyle, rewriteSuggestion } from "@/lib/server/analyze";
import { REWRITE_ACTIONS, TONE_MAP, isToneId, type RewriteAction } from "@/lib/tones";
import { friendlyError } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ReplyCard } from "./reply-card";

function asSuggestion(row: { id: string; style: string; body: string }): ConversationDetail["suggestions"][number] {
  return { ...row, createdAt: new Date().toISOString() };
}

export function ConversationView({ initial }: { initial: ConversationDetail }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rewriteFor, setRewriteFor] = useState<{ id: string; style: string; body: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const latestByStyle = useMemo(() => {
    const map = new Map<string, ConversationDetail["suggestions"][number]>();
    for (const s of [...detail.suggestions].reverse()) map.set(s.style, s);
    return [...map.values()];
  }, [detail.suggestions]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  async function runRewrite(suggestionId: string, action: RewriteAction) {
    setBusyId(suggestionId);
    try {
      const next = await rewriteSuggestion({
        data: { conversationId: detail.id, suggestionId, action },
      });
      setDetail((d) => ({ ...d, suggestions: [asSuggestion(next), ...d.suggestions] }));
      setRewriteFor(null);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function runRegen(style: string) {
    setBusyId(style);
    try {
      const next = await regenerateStyle({
        data: { conversationId: detail.id, style, instruction: detail.instruction ?? undefined },
      });
      setDetail((d) => ({
        ...d,
        summary: next.summary ?? d.summary,
        suggestions: [asSuggestion(next), ...d.suggestions],
      }));
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {renaming ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void renameConversation({ data: { id: detail.id, title } }).then(() => {
                  setDetail((d) => ({ ...d, title }));
                  setRenaming(false);
                });
              }}
            >
              <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Conversation name" />
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          ) : (
            <h1 className="font-display text-2xl leading-tight">{detail.title}</h1>
          )}
        </div>
        <Button variant="ghost" size="icon" aria-label="Conversation actions" onClick={() => setMenuOpen(true)}>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {detail.summary ? (
        <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm leading-relaxed">{detail.summary}</p>
      ) : null}

      {detail.needsClarification && detail.clarification ? (
        <p className="mt-3 rounded-xl border border-border px-4 py-3 text-sm text-muted">{detail.clarification}</p>
      ) : null}

      {detail.imageDataUrl ? (
        <img src={detail.imageDataUrl} alt="Saved screenshot" className="mt-4 max-h-48 w-full rounded-lg object-contain bg-surface-2" />
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        {latestByStyle.map((s) => (
          <ReplyCard
            key={s.id}
            style={s.style}
            body={s.body}
            busy={busyId === s.id || busyId === s.style}
            onCopy={() => copy(s.body)}
            onRewrite={() => setRewriteFor({ id: s.id, style: s.style, body: s.body })}
            onShorten={() => void runRewrite(s.id, "shorten")}
            onRegenerate={() => void runRegen(s.style)}
          />
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full"
        onClick={() => void navigate({ to: "/app/compose", search: { continue: detail.id } })}
      >
        Continue this conversation
      </Button>

      <Sheet open={Boolean(rewriteFor)} onOpenChange={(open) => !open && setRewriteFor(null)}>
        <SheetContent>
          <SheetTitle>Rewrite</SheetTitle>
          <p className="mt-1 text-sm text-muted">
            {rewriteFor && isToneId(rewriteFor.style) ? TONE_MAP[rewriteFor.style].label : "This reply"}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-fg">{rewriteFor?.body}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {REWRITE_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                disabled={!rewriteFor || Boolean(busyId)}
                onClick={() => rewriteFor && void runRewrite(rewriteFor.id, action.id)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent>
          <SheetTitle>Conversation</SheetTitle>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setMenuOpen(false);
                setRenaming(true);
              }}
            >
              <Pencil className="h-4 w-4" /> Rename
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={async () => {
                await archiveConversation({ data: { id: detail.id, archived: !detail.archived } });
                toast.success(detail.archived ? "Restored" : "Archived");
                setMenuOpen(false);
                void navigate({ to: "/app/history" });
              }}
            >
              <Archive className="h-4 w-4" /> {detail.archived ? "Unarchive" : "Archive"}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={async () => {
                await deleteConversationScreenshot({ data: { id: detail.id } });
                setDetail((d) => ({ ...d, imageDataUrl: null }));
                toast.success("Screenshot deleted");
                setMenuOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete screenshot
            </Button>
            <Button variant="danger" className="justify-start" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete conversation
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            Replies, analysis, and any saved screenshot will be removed from your account.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteConversation({ data: { id: detail.id } });
                toast.success("Deleted");
                void navigate({ to: "/app/history" });
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
