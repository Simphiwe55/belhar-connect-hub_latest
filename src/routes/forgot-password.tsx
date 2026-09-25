import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { recordEvent } from "@/lib/tracking";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Connectly" },
      {
        name: "description",
        content: "Request a password reset link for your Connectly account.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (resetError) {
        throw resetError;
      }

      recordEvent("password_reset_request", { email: trimmedEmail });
      setIsSent(true);
      toast.success("Password reset link sent. Check your email.");

      setTimeout(() => {
        navigate({ to: "/login", replace: true });
      }, 1800);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send a reset link right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="card-surface border-primary/10 bg-white/80 p-6 shadow-[0_18px_50px_rgba(16,24,40,0.08)] backdrop-blur-sm sm:p-8">
          <h1 className="font-display text-3xl font-extrabold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We’ll send a secure reset link to your email so you can choose a new password.
          </p>

          {isSent ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Check your email for the reset link. You’ll be redirected to the login screen shortly.
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Email address</span>
                <input
                  className="field"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.co.za"
                  required
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending link..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="font-semibold text-primary">Back to login</Link>
          </p>
        </div>
      </div>
    </MarketingLayout>
  );
}
