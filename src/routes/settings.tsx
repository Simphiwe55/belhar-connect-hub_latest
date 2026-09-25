import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { usePaymentMethods, useUserPreferences } from "@/lib/hooks";
import { useProfile, useSignOut } from "@/lib/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getRecentActivity, recordEvent } from "@/lib/tracking";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Connectly" },
      {
        name: "description",
        content: "Manage your Connectly account, notifications, language and appearance.",
      },
      { property: "og:title", content: "Settings — Connectly" },
      { property: "og:description", content: "Account and notification preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { profile } = useProfile();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useUserPreferences();
  const profileName = profile?.full_name ?? "Your name";
  const profileEmail = profile?.email ?? "your@email.com";
  const profilePhone = profile?.phone ?? "No phone number added";
  const profileLocation = profile?.location ?? "Belhar, Cape Town";
  const { methods, addPaymentMethod, removePaymentMethod, setDefault } = usePaymentMethods();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ cardName: "", cardNumber: "", cvv: "", expiry: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const recentActivity = useMemo(() => getRecentActivity(), []);

  const flip = (k: string) => {
    const notifKey = k as keyof typeof preferences.notifications;
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        [notifKey]: !preferences.notifications[notifKey],
      },
    });
  };

  const handleToggleDarkMode = () => {
    updatePreferences({ theme: preferences.theme === "light" ? "dark" : "light" });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", preferences.theme === "light");
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPayment.cardName.trim()) {
      toast.error("Card name is required");
      return;
    }
    if (!newPayment.cardNumber.trim() || newPayment.cardNumber.length < 16) {
      toast.error("Valid card number is required");
      return;
    }
    if (!newPayment.cvv.trim() || newPayment.cvv.length < 3) {
      toast.error("Valid CVV is required");
      return;
    }

    const newMethod = {
      id: `pm${Date.now()}`,
      type: "card" as const,
      name: newPayment.cardName,
      details: `**** **** **** ${newPayment.cardNumber.slice(-4)}`,
      isDefault: methods.length === 0,
      lastUsed: "Just now",
    };

    addPaymentMethod(newMethod);
    setNewPayment({ cardName: "", cardNumber: "", cvv: "", expiry: "" });
    setShowAddPayment(false);
    toast.success("Card added successfully");
  };

  const handleRemovePayment = (id: string) => {
    removePaymentMethod(id);
    setShowDeleteConfirm(null);
    toast.success("Payment method removed");
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const { error } = await supabase.rpc("delete_own_account");

      if (error) {
        throw error;
      }

      recordEvent("account_deleted", { deletedAt: new Date().toISOString() });
      await supabase.auth.signOut().catch(() => null);
      toast.success("Your account has been deleted.");
      navigate({ to: "/login", replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete your account right now. Please contact support.");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountConfirm(false);
    }
  };

  const notificationToggles = [
    { key: "newJobMatches", label: "New job matches" },
    { key: "applicationUpdates", label: "Application updates" },
    { key: "messages", label: "Messages" },
    { key: "weeklyEarningSummary", label: "Weekly earnings summary" },
  ];

  return (
    <AppShell role={profile?.role === "worker" ? "worker" : "member"} title="Settings" subtitle="Account, notifications and appearance">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Account</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={profileName} />
            <Row label="Email" value={profileEmail} />
            <Row label="Phone" value={profilePhone} />
            <Row label="Location" value={profileLocation} />
          </div>
          <div className="mt-5 space-y-2">
            <Link to="/profile" className="btn-secondary w-full" title="Edit your profile information">
              Edit profile
            </Link>
            <Link to="/forgot-password" className="btn-secondary w-full" title="Change your account password">
              Change password
            </Link>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Preferences</h2>
          <div className="mt-4 space-y-1">
            {notificationToggles.map((item) => (
              <button
                key={item.key}
                onClick={() => flip(item.key)}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-3 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{item.label}</span>
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    preferences.notifications[item.key as keyof typeof preferences.notifications]
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                      preferences.notifications[item.key as keyof typeof preferences.notifications]
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </span>
              </button>
            ))}
            <button
              onClick={handleToggleDarkMode}
              className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-3 text-left text-sm hover:bg-muted"
            >
              <span className="font-medium">Dark mode</span>
              <span
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  preferences.theme === "dark" ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                    preferences.theme === "dark" ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold">Language</span>
            <select
              value={preferences.language}
              onChange={(e) => updatePreferences({ language: e.target.value })}
              className="field"
            >
              <option>English</option>
              <option>Afrikaans</option>
              <option>isiXhosa</option>
            </select>
          </label>
        </div>

        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold">Payment Methods</h2>
            <button
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="btn-primary !h-10 !px-4 !text-sm"
              title="Add a new payment method"
            >
              + Add Payment Method
            </button>
          </div>

          {showAddPayment && (
            <form onSubmit={handleAddPayment} className="mt-4 space-y-3 rounded-lg border border-border p-4">
              <label>
                <span className="mb-1 block text-sm font-semibold">Card Name</span>
                <input
                  type="text"
                  value={newPayment.cardName}
                  onChange={(e) => setNewPayment({ ...newPayment, cardName: e.target.value })}
                  className="field"
                  placeholder="e.g., My Visa Card"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold">Card Number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={newPayment.cardNumber}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      cardNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="field"
                  placeholder="1234 5678 9012 3456"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-sm font-semibold">CVV</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPayment.cvv}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="field"
                    placeholder="123"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">Expires</span>
                  <input
                    type="text"
                    className="field"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={newPayment.expiry}
                    onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 space-y-2">
            {methods.length > 0 ? (
              methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div>
                    <div className="font-semibold">
                      {method.name}{" "}
                      {method.isDefault && <span className="text-xs text-primary">(Default)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {method.details} · Last used: {method.lastUsed}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefault(method.id)}
                        className="btn-ghost !h-9 !text-xs"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(method.id)}
                      className="btn-ghost !h-9 !text-xs !text-destructive"
                    >
                      Delete
                    </button>
                  </div>

                  {showDeleteConfirm === method.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="card-surface max-w-sm space-y-4 p-6">
                        <h3 className="font-display text-lg font-bold">Remove Payment Method?</h3>
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to remove {method.name}? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRemovePayment(method.id)}
                            className="btn-primary flex-1 !text-destructive"
                          >
                            Yes, remove
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment methods yet. Add one to get started.
              </p>
            )}
          </div>
        </div>

        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold">Support</h2>
            <button
              onClick={() => setShowDeleteAccountConfirm(true)}
              className="btn-ghost !text-destructive"
            >
              Delete account
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button onClick={() => toast.info("Help centre articles are being prepared for launch.")} className="btn-secondary w-full" title="Visit help center">
              Help centre
            </button>
            <button onClick={() => toast.success("Problem report opened. A support agent will follow up.")} className="btn-secondary w-full" title="Report a problem">
              Report a problem
            </button>
            <button onClick={() => toast.info("Community guidelines: be respectful, pay fairly, and keep all job communication inside Connectly.")} className="btn-secondary w-full" title="Read community guidelines">
              Community guidelines
            </button>
          </div>
          <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
            <h3 className="text-sm font-semibold text-foreground">Recent account activity</h3>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface px-2 py-1.5">
                    <span>{item.type}</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p>No recent activity yet.</p>
              )}
            </div>
          </div>
          <button onClick={signOut} className="btn-ghost mt-4 w-full !text-destructive">
            Log out
          </button>
        </div>

        {showDeleteAccountConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card-surface max-w-md space-y-4 p-6">
              <h3 className="font-display text-xl font-bold">Delete your account?</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently remove your Connectly account and all related activity. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="btn-primary flex-1 !bg-red-600 hover:!bg-red-700"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
