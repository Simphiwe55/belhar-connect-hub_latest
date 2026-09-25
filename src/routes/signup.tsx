import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { categories } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Connectly Belhar" },
      {
        name: "description",
        content:
          "Create a free Connectly account as a Community Member to post jobs, or as a Worker to find paid work in Belhar, Cape Town.",
      },
      { property: "og:title", content: "Sign up for Connectly" },
      { property: "og:description", content: "Join Belhar's community job marketplace — free." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const [role, setRole] = useState<"member" | "worker">("member");
  const [skills, setSkills] = useState<string[]>(["Gardener"]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("Belhar, Cape Town");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  const toggleSkill = (s: string) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedFullName || !trimmedEmail || !trimmedPassword) {
      setError("Please fill in your full name, email and password.");
      setSuccess(null);
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSuccess(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            full_name: trimmedFullName,
            phone: phone.trim(),
            location: location.trim(),
            role,
            skills,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && data.user.email_confirmed_at) {
        navigate({ to: role === "member" ? "/member/dashboard" : "/worker/dashboard" });
        return;
      }

      setSuccess("Account created. Please check your email for a verification link before signing in.");
      setShowVerificationModal(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create your account right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,106,79,0.16),_transparent_35%),linear-gradient(180deg,_rgba(248,249,250,1),_rgba(234,241,236,1))]">
        <div className="absolute -left-12 top-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative mx-auto max-w-xl px-4 py-14 sm:px-6">
          <div className="card-surface border-primary/10 bg-white/80 p-6 shadow-[0_18px_50px_rgba(16,24,40,0.08)] backdrop-blur-sm sm:p-8">
            <h1 className="font-display text-3xl font-extrabold">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Free to join. It takes about two minutes.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              <RoleTab active={role === "member"} onClick={() => setRole("member")}>
                🙋🏽 I need help
              </RoleTab>
              <RoleTab active={role === "worker"} onClick={() => setRole("worker")}>
                🧰 I want to work
              </RoleTab>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          <Field label="Full name">
            <input
              className="field"
              placeholder="e.g. Fatima Adams"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>
          <Field label="Email address">
            <input
              className="field"
              type="email"
              placeholder="you@example.co.za"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Phone number">
            <input
              className="field"
              type="tel"
              placeholder="072 123 4567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field label="Password">
            <input
              className="field"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              className="field"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </Field>

          {role === "worker" && (
            <>
              <Field label="Your skills">
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const on = skills.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => toggleSkill(c)}
                        className={`pill border ${
                          on
                            ? "border-primary bg-accent text-primary"
                            : "border-border bg-surface text-muted-foreground"
                        }`}
                      >
                        {on ? "✓ " : "+ "}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Experience level">
                <select className="field">
                  <option>Entry Level</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </Field>
            </>
          )}

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--primary)]" />
            <span>
              I agree to the Connectly Terms of Service and Community Guidelines for Belhar members.
            </span>
          </label>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Creating account..."
              : `Create ${role === "member" ? "Community Member" : "Worker"} account`}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Log in
            </Link>
          </p>
            </form>
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card-surface max-w-md space-y-4 p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl">✉️</div>
            <h3 className="font-display text-2xl font-bold">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to your email. Please open it, then sign in to continue.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowVerificationModal(false);
                navigate({ to: "/login" });
              }}
              className="btn-primary w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </MarketingLayout>
  );
}

function RoleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-lg text-sm font-semibold transition-colors ${
        active ? "bg-surface text-primary shadow-[var(--shadow-card)]" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
