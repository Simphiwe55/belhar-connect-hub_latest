import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Connectly" },
      {
        name: "description",
        content:
          "Log in to Connectly to manage your jobs, applications and messages in Belhar, Cape Town.",
      },
      { property: "og:title", content: "Log in to Connectly" },
      { property: "og:description", content: "Access your Connectly dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const [role, setRole] = useState<"member" | "worker">("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSocialSignIn = (provider: "Google" | "Facebook") => {
    toast.info(`${provider} sign-in is coming soon. Please use your email and password for now.`);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both your email/phone and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
          setError("No account found for that email. Please create an account first.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (!data.user) {
        setError("No account found for that email. Please create an account first.");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      navigate({
        to: profileData?.role === "worker" ? "/worker/dashboard" : "/member/dashboard",
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to log in right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,106,79,0.16),_transparent_35%),linear-gradient(180deg,_rgba(248,249,250,1),_rgba(240,244,239,1))]">
        <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="card-surface border-primary/10 bg-white/80 p-6 backdrop-blur-sm shadow-[0_18px_50px_rgba(16,24,40,0.08)] sm:p-8">
            <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Log in to continue on Connectly.</p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              {(["member", "worker"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`h-11 rounded-lg text-sm font-semibold transition-colors ${
                    role === r
                      ? "bg-surface text-primary shadow-[var(--shadow-card)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {r === "member" ? "Community Member" : "Worker"}
                </button>
              ))}
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email or phone</span>
            <input
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.co.za or 072 123 4567"
              aria-invalid={Boolean(error)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Password</span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(error)}
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /> Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Logging in..."
              : `Log in as ${role === "member" ? "Community Member" : "Worker"}`}
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or continue with{" "}
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="btn-secondary w-full !text-foreground"
              onClick={() => handleSocialSignIn("Google")}
            >
              Google
            </button>
            <button
              type="button"
              className="btn-secondary w-full !text-foreground"
              onClick={() => handleSocialSignIn("Facebook")}
            >
              Facebook
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New to Connectly?{" "}
            <Link to="/signup" className="font-semibold text-primary">
              Create an account
            </Link>
          </p>
            </form>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
