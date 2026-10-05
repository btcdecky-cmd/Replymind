import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConversationView } from "@/components/replies/conversation-view";
import { Skeleton } from "@/components/ui/skeleton";
import { getConversation, type ConversationDetail } from "@/lib/server/conversations";

export const Route = createFileRoute("/app/c/$conversationId")({
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const [detail, setDetail] = useState<ConversationDetail | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setDetail(undefined);
    void getConversation({ data: { id: conversationId } })
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  if (detail === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pt-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-2xl">Conversation not found</h1>
        <p className="mt-2 text-sm text-muted">It may have been deleted, or it belongs to another account.</p>
        <Link to="/app" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
          Back home
        </Link>
      </div>
    );
  }
  return <ConversationView initial={detail} />;
}
