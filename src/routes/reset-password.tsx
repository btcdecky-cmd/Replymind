import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password });
      if (error) setMessage(error.message ?? "This reset link is invalid or expired.");
      else setMessage("Password updated. You can log in now.");
    } catch {
      setMessage("This reset link is invalid or expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <Logo />
      <h1 className="mt-8 font-display text-3xl">Choose a new password</h1>
      <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message ? <p className="text-sm text-muted">{message}</p> : null}
        <Button type="submit" disabled={busy}>
          Update password
        </Button>
      </form>
      <Link to="/login" className="mt-6 text-sm text-muted underline-offset-4 hover:underline">
        Back to log in
      </Link>
    </main>
  );
}
