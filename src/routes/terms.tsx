import { Link, createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Logo />
      <h1 className="mt-8 font-display text-4xl">Terms</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>ReplyMind is an assistant. You are responsible for anything you send in a real conversation.</p>
        <p>
          Do not upload content you are not allowed to share. Suggested replies can be wrong, incomplete, or a poor fit.
          Read them before you send.
        </p>
        <p>
          Free use is limited. Limits exist so the product stays available. We may refuse abusive or automated traffic.
        </p>
        <p>The service may be unavailable if the model, database, or host is down. We’ll fail closed rather than leak data.</p>
      </div>
      <Link to="/" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
        Back home
      </Link>
    </main>
  );
}
