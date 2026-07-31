import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { GlassCard } from "@/components/ui-kit";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — ATHLETE OS" },
      { name: "description", content: "Create your ATHLETE OS account and start logging training." },
      { property: "og:title", content: "Sign in — ATHLETE OS" },
      { property: "og:description", content: "Create your athlete account and start logging." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthUser();

  useEffect(() => {
    if (user) navigate({ to: "/home", replace: true });
  }, [user, navigate]);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created — let's build your profile.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home" });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-12">
      <Link
        to="/"
        className="mb-6 inline-flex w-fit items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">
          {mode === "signup" ? "Create your athlete profile" : "Welcome back, athlete"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Your programs, logs and PRs sync to your account."
            : "Pick up right where your last session ended."}
        </p>

        <GlassCard className="mt-6 p-5">
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/70 py-3 text-sm font-semibold disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name or nickname"
                className="w-full rounded-xl border border-border bg-surface-2/70 px-4 py-3 text-sm outline-none focus:border-primary/60"
              />
            ) : null}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-surface-2/70 px-4 py-3 text-sm outline-none focus:border-primary/60"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-surface-2/70 px-4 py-3 text-sm outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : null}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        </GlassCard>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-5 w-full text-center text-xs text-muted-foreground"
        >
          {mode === "signup" ? (
            <>
              Already training here? <span className="text-lime">Sign in</span>
            </>
          ) : (
            <>
              New to ATHLETE OS? <span className="text-lime">Create an account</span>
            </>
          )}
        </button>
      </motion.div>
    </main>
  );
}
