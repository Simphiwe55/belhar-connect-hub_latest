import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/ui-kit";
import { formatCurrency, readWorkerWallet, withdrawWorkerEarnings } from "@/lib/worker-wallet";
import { usePaymentMethods } from "@/lib/hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — Connectly" },
      {
        name: "description",
        content: "Track what you've earned this week, view transactions and withdraw on Connectly.",
      },
      { property: "og:title", content: "Earnings — Connectly" },
      { property: "og:description", content: "Your Connectly income in Rand." },
    ],
  }),
  component: Earnings,
});

function Earnings() {
  const [wallet, setWallet] = useState(() => readWorkerWallet());
  const [amount, setAmount] = useState(String(readWorkerWallet().availableToWithdraw));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { methods } = usePaymentMethods();
  const defaultMethod = methods.find((method) => method.isDefault) ?? methods[0];
  const activePaymentMethod =
    defaultMethod ?? {
      id: "worker-card",
      type: "card" as const,
      name: wallet.cardBrand,
      details: `•••• ${wallet.cardLast4}`,
      isDefault: true,
    };

  const weeklyValues = useMemo(
    () => [
      { day: "Mon", amount: 450 },
      { day: "Tue", amount: 0 },
      { day: "Wed", amount: 700 },
      { day: "Thu", amount: 380 },
      { day: "Fri", amount: 1200 },
      { day: "Sat", amount: 900 },
      { day: "Sun", amount: 0 },
    ],
    [],
  );

  const max = Math.max(...weeklyValues.map((d) => d.amount));
  const weekTotal = weeklyValues.reduce((sum, day) => sum + day.amount, 0);

  const handleWithdraw = () => {
    const numericAmount = Number(amount);
    setError(null);
    setSuccess(null);

    try {
      const nextWallet = withdrawWorkerEarnings(numericAmount);
      setWallet(nextWallet);
      setAmount(String(Math.max(nextWallet.availableToWithdraw, 0)));
      const message = `Withdrawal of ${formatCurrency(numericAmount)} is moving to your ${nextWallet.cardBrand} card ending in ${nextWallet.cardLast4}.`;
      setSuccess(message);
      toast.success(message);
    } catch (withdrawError) {
      const message = withdrawError instanceof Error ? withdrawError.message : "Withdrawal failed.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <AppShell
      role="worker"
      title="Earnings"
      subtitle="Paid out every Friday"
      action={
        <button className="btn-primary" onClick={handleWithdraw} type="button">
          Withdraw Earnings
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={formatCurrency(wallet.totalEarned)} hint="Since March 2026" icon="💰" />
        <StatCard label="This week" value={formatCurrency(weekTotal)} hint="6 jobs" icon="📈" />
        <StatCard label="Available to withdraw" value={formatCurrency(wallet.availableToWithdraw)} hint="Cleared funds" icon="🏦" />
      </div>

      <div className="card-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Payout method</h2>
            <p className="text-sm text-muted-foreground">
              {activePaymentMethod ? `${activePaymentMethod.name} · ${activePaymentMethod.details}` : "No payment method added yet."}
            </p>
          </div>
          <Link to="/settings" className="btn-secondary !h-10 !px-4 !text-sm">
            Manage payment methods
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">This week</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {weeklyValues.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">{d.amount ? formatCurrency(d.amount) : ""}</span>
                <div
                  className="w-full rounded-t-lg bg-[linear-gradient(180deg,var(--primary),var(--primary-dark))]"
                  style={{ height: `${max ? (d.amount / max) * 100 : 0}%`, minHeight: 4 }}
                />
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Worker card</h2>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">{wallet.cardBrand}</span>
          </div>

          <div className="rounded-2xl bg-[linear-gradient(135deg,#1f4e39,#2d6a4f)] p-4 text-white shadow-lg">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-100">Connectly payout</div>
            <div className="mt-6 text-2xl font-display font-bold">{formatCurrency(wallet.cardBalance)}</div>
            <div className="mt-6 flex items-center justify-between text-sm text-emerald-100">
              <span>{wallet.cardHolder}</span>
              <span>•••• {wallet.cardLast4}</span>
            </div>
          </div>

          <label className="mt-5 block text-sm font-medium text-muted-foreground">Withdrawal amount</label>
          <input
            type="number"
            min="0"
            step="10"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="field mt-2"
            placeholder="R0"
          />

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-green-700">{success}</p> : null}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Available</span>
            <span className="font-semibold text-foreground">{formatCurrency(wallet.availableToWithdraw)}</span>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <h2 className="border-b border-border p-5 font-display text-lg font-bold">Transactions</h2>
        <ul className="divide-y divide-border">
          {wallet.transactions.map((t) => (
            <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 p-4">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{t.description}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.type === "withdrawal" ? "Withdrawal" : "Payment"} · {new Date(t.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </span>
              <span
                className={`shrink-0 font-display font-bold ${
                  t.type === "withdrawal" ? "text-muted-foreground" : "text-primary"
                }`}
              >
                {t.type === "withdrawal" ? "-" : "+"}
                {formatCurrency(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
