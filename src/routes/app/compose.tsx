import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ComposeFlow } from "@/components/compose/compose-flow";

export const Route = createFileRoute("/app/compose")({
  validateSearch: z.object({
    continue: z.string().optional(),
  }),
  component: ComposePage,
});

function ComposePage() {
  const { continue: conversationId } = Route.useSearch();
  return <ComposeFlow conversationId={conversationId} />;
}
