import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });
      if (error) {
        setMessage(
          "Password reset email isn’t available in this environment. Sign in with Google or X, or create a new email account if you still have access.",
        );
      } else {
        setMessage("If an account exists for that email, a reset link will arrive shortly.");
      }
    } catch {
      setMessage(
        "Password reset email isn’t available in this environment. Sign in with Google or X, or try logging in again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <Logo />
      <h1 className="mt-8 font-display text-3xl">Reset your password</h1>
      <p className="mt-2 text-sm text-muted">We’ll send a link if this email is on an account.</p>
      <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {message ? <p className="text-sm text-muted">{message}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <Link to="/login" className="mt-6 text-sm text-muted underline-offset-4 hover:underline">
        Back to log in
      </Link>
    </main>
  );
}
