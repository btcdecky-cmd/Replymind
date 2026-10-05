import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConversationList } from "@/components/history/conversation-list";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { listConversations, type ConversationListItem } from "@/lib/server/conversations";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const user = useCurrentUser();
  const [items, setItems] = useState<ConversationListItem[] | null>(null);

  useEffect(() => {
    void listConversations({ data: { archived: false } })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const first = user?.displayName?.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-6">
      <p className="text-sm text-muted">{first ? `Hi, ${first}` : "Welcome back"}</p>
      <h1 className="mt-1 font-display text-3xl">What’s the situation?</h1>
      <Button className="mt-6 w-full" size="lg" asChild>
        <Link to="/app/compose">New reply</Link>
      </Button>
      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-display text-xl">Recent</h2>
        <Link to="/app/history" className="text-sm text-muted underline-offset-4 hover:underline">
          See all
        </Link>
      </div>
      {items === null ? (
        <p className="mt-4 text-sm text-muted">Loading conversations…</p>
      ) : (
        <ConversationList items={items.slice(0, 6)} empty="No conversations yet. Upload a screenshot to start." />
      )}
    </div>
  );
}
