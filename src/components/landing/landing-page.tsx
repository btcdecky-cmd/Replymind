import { Link } from "@tanstack/react-router";
import {
  Camera,
  Check,
  ChevronDown,
  EyeOff,
  Lock,
  MessageSquareText,
  ScanText,
  Shield,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { TONES } from "@/lib/tones";
import { AuthSlot } from "../auth-slot";
import { Logo } from "../logo";
import { ToneIcon } from "../tone-icon";
import { Button } from "../ui/button";

const STEPS = [
  {
    icon: Camera,
    title: "Upload the moment",
    body: "Drop in a screenshot, paste the thread, or type the last message. ReplyMind only sees what you send.",
  },
  {
    icon: ScanText,
    title: "It reads the room",
    body: "Who is speaking, what the latest line means, and how the other person may be feeling — without over-explaining.",
  },
  {
    icon: WandSparkles,
    title: "You pick the voice",
    body: "Natural, warm, romantic, short, reassuring — then copy, shorten, or rewrite until it sounds like you.",
  },
];

const FEATURES = [
  { icon: MessageSquareText, title: "Context-aware replies", body: "Drafts answer the last message, not a summary of the whole chat." },
  { icon: Sparkles, title: "Tone that you choose", body: "Eleven styles, plus shorten, soften, and rewrite on a single card." },
  { icon: Shield, title: "Private by default", body: "Signed-in only. Screenshots stay off the record unless you keep them." },
  { icon: EyeOff, title: "No leaked keys", body: "The model runs on the server. Your key never reaches the browser." },
];

const FAQS = [
  {
    q: "Does it send my screenshots to train a model?",
    a: "Screenshots are sent to xAI only to draft your replies, from the server. We do not keep images unless you turn on “Keep screenshots” or save a conversation with that setting on.",
  },
  {
    q: "Will the reply sound like me?",
    a: "Tell ReplyMind what you want to say — “I’m not angry,” “I miss her” — and pick a tone. Then rewrite until it feels right. It will not invent facts about you.",
  },
  {
    q: "What if the screenshot is blurry?",
    a: "It will ask a short clarifying question instead of guessing. You can also paste the text.",
  },
  {
    q: "Can I use this on my phone home screen?",
    a: "Yes. ReplyMind is a PWA. Install it from the browser menu for a full-screen, private reply pad.",
  },
];

export function LandingPage() {
  const { user, isPending } = useCurrentUserState();
  const ctaTo = !isPending && user ? "/app" : "/signup";

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 safe-top">
        <Logo />
        <AuthSlot />
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:pt-20">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">Private reply assistant</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">Know exactly what to say.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Upload a conversation, understand the moment, and get a reply that actually sounds like you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to={ctaTo}>Try it free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how">See how it works</a>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-16">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] md:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Example</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-surface-2 p-4">
                <p className="text-xs text-muted">Them</p>
                <p className="mt-2 text-sm leading-relaxed">
                  I don’t know… it just feels like this is becoming complicated. I don’t want complicated.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg p-4">
                <p className="text-xs text-muted">Natural reply</p>
                <p className="mt-2 text-sm leading-relaxed">
                  I understand what you mean. I don’t want this to feel complicated either. I just want us to take things one
                  step at a time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="font-display text-3xl">Screenshot, then a reply that fits.</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-surface p-5">
                <step.icon className="h-5 w-5 text-muted" />
                <p className="mt-4 text-xs font-medium text-muted">0{i + 1}</p>
                <h3 className="mt-1 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-display text-3xl">Reply styles</h2>
          <p className="mt-2 max-w-lg text-muted">Pick a voice, then reshape a single card — not the whole set.</p>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {TONES.map((tone) => (
              <li key={tone.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3">
                <ToneIcon icon={tone.icon} className="h-4 w-4 text-muted" />
                <div>
                  <p className="text-sm font-medium">{tone.label}</p>
                  <p className="text-xs text-muted">{tone.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-display text-3xl">Built for the message you almost sent.</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-xl border border-border bg-surface p-5">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-12">
          <div className="rounded-2xl bg-primary px-6 py-10 text-primary-fg md:px-10">
            <Lock className="h-5 w-5" />
            <h2 className="mt-4 font-display text-3xl">Private conversations stay private.</h2>
            <ul className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              {[
                "Authenticated access only",
                "Images scoped to your account",
                "Server-side model calls",
                "Delete a chat or screenshot anytime",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {line}
                </li>
              ))}
            </ul>
            <Button className="mt-8 bg-primary-fg text-primary hover:opacity-90" asChild>
              <Link to="/privacy">Read the privacy notes</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-display text-3xl">Questions</h2>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 max-w-2xl text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 text-center">
          <h2 className="font-display text-4xl">Write the next line with a clear head.</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">Free to try. Sign in, upload a moment, copy a reply.</p>
          <Button size="lg" className="mt-6" asChild>
            <Link to={ctaTo}>Try it free</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <nav className="flex flex-wrap gap-4">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/login">Log in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
