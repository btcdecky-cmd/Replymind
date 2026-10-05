import { Link, createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Logo />
      <h1 className="mt-8 font-display text-4xl">Privacy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>ReplyMind is built for private conversations. You must be signed in to upload, analyze, or save anything.</p>
        <p>
          Screenshots and pasted threads are sent to xAI from the server so the model can draft replies. API keys never
          ship to the browser.
        </p>
        <p>
          Images are not kept by default. Temporary screenshots expire within 24 hours. Turn on “Keep screenshots” only
          if you want a copy attached to a saved conversation. You can delete a screenshot or a whole conversation at any
          time.
        </p>
        <p>
          Every private record is scoped to your user id on the server. We never trust a client-supplied user id. Usage
          limits are enforced server-side.
        </p>
        <p>
          Deleting account data removes conversations, images, analyses, replies, preferences, and usage history stored
          by this app.
        </p>
      </div>
      <Link to="/" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
        Back home
      </Link>
    </main>
  );
}
