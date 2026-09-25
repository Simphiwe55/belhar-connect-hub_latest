import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { recordEvent } from "@/lib/tracking";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Connectly" },
      { name: "description", content: "Create a new password for your Connectly account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      recordEvent("password_reset_success", { updatedAt: new Date().toISOString() });
      toast.success("Password updated successfully.");
      navigate({ to: "/login", replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "This reset link is invalid or expired. Please request a new one.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="card-surface border-primary/10 bg-white/80 p-6 shadow-[0_18px_50px_rgba(16,24,40,0.08)] backdrop-blur-sm sm:p-8">
          <h1 className="font-display text-3xl font-extrabold">Create a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for your Connectly account.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">New password</span>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Confirm password</span>
              <input
                className="field"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating password..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </MarketingLayout>
  );
}
