import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { friendlyError } from "@/lib/utils";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0],
          callbackURL: "/app",
        });
        if (err) throw new Error(err.message ?? "Could not create the account.");
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/app",
        });
        if (err) throw new Error(err.message ?? "Could not sign in.");
      }
      window.location.href = "/app";
    } catch (err) {
      setError(friendlyError(err, "Could not complete sign-in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <Logo />
      <h1 className="mt-8 font-display text-3xl">{mode === "signup" ? "Create your space" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "signup"
          ? "Replies stay on your account. You can delete a conversation anytime."
          : "Sign in to pick up the conversations you saved."}
      </p>

      {authEnabled ? (
        <div className="mt-6 flex flex-col gap-2">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="outline"
              onClick={() => signIn(p.providerId, { callbackURL: "/app", errorCallbackURL: "/login" })}
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
      )}

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-subtle">
        <span className="h-px flex-1 bg-border" />
        or email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        {mode === "signup" ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </div>
        {mode === "login" ? (
          <Link to="/forgot-password" className="text-sm text-muted underline-offset-4 hover:underline">
            Forgot password
          </Link>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-fg underline-offset-4 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link to="/signup" className="text-fg underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
