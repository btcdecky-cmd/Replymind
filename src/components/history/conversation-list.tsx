import { Link } from "@tanstack/react-router";
import { Camera, FileText, Keyboard } from "lucide-react";
import type { ConversationListItem } from "@/lib/server/conversations";
import { formatRelative } from "@/lib/utils";

export function ConversationList({ items, empty }: { items: ConversationListItem[]; empty: string }) {
  if (items.length === 0) {
    return <p className="mt-8 text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.source === "screenshot" ? Camera : item.source === "paste" ? FileText : Keyboard;
        return (
          <li key={item.id}>
            <Link
              to="/app/c/$conversationId"
              params={{ conversationId: item.id }}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface-2">
                <Icon className="h-4 w-4 text-muted" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-subtle">{formatRelative(item.updatedAt)}</span>
                </span>
                {item.preview ? <span className="mt-1 line-clamp-2 block text-sm text-muted">{item.preview}</span> : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
