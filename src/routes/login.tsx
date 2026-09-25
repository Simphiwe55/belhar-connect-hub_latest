import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";

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
  const navigate = useNavigate();

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
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

        <form
          className="card-surface mt-6 space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();

            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim();

            if (!trimmedEmail || !trimmedPassword) {
              setError("Please enter both your email/phone and password.");
              return;
            }

            setError(null);
            navigate({ to: role === "member" ? "/member/dashboard" : "/worker/dashboard" });
          }}
        >
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
            <button type="button" className="font-semibold text-primary">
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn-primary w-full">
            Log in as {role === "member" ? "Community Member" : "Worker"}
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or continue with{" "}
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn-secondary w-full !text-foreground">
              Google
            </button>
            <button type="button" className="btn-secondary w-full !text-foreground">
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
    </MarketingLayout>
  );
}
