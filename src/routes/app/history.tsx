import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConversationList } from "@/components/history/conversation-list";
import { Button } from "@/components/ui/button";
import { listConversations, type ConversationListItem } from "@/lib/server/conversations";

export const Route = createFileRoute("/app/history")({ component: HistoryPage });

function HistoryPage() {
  const [archived, setArchived] = useState(false);
  const [items, setItems] = useState<ConversationListItem[] | null>(null);

  useEffect(() => {
    setItems(null);
    void listConversations({ data: { archived } })
      .then(setItems)
      .catch(() => setItems([]));
  }, [archived]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-6">
      <h1 className="font-display text-3xl">Conversations</h1>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant={archived ? "outline" : "default"} onClick={() => setArchived(false)}>
          Active
        </Button>
        <Button size="sm" variant={archived ? "default" : "outline"} onClick={() => setArchived(true)}>
          Archived
        </Button>
      </div>
      {items === null ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <ConversationList
          items={items}
          empty={archived ? "Nothing archived." : "No saved conversations yet."}
        />
      )}
    </div>
  );
}
