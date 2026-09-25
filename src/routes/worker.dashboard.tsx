import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { JobCard, StatCard, Section } from "@/components/ui-kit";
import { useApplications, useAvailability, useJobs } from "@/lib/hooks";
import { formatCurrency, readWorkerWallet } from "@/lib/worker-wallet";

export const Route = createFileRoute("/worker/dashboard")({
  head: () => ({
    meta: [
      { title: "Worker Dashboard — Connectly" },
      {
        name: "description",
        content: "See recommended jobs near you, your rating and earnings on Connectly.",
      },
      { property: "og:title", content: "Worker Dashboard — Connectly" },
      { property: "og:description", content: "Your work, rating and income in Belhar." },
    ],
  }),
  component: WorkerDashboard,
});

function WorkerDashboard() {
  const { available, toggleAvailability } = useAvailability();
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const { applied } = useApplications();
  const wallet = readWorkerWallet();
  const openJobs = jobs.filter((job) => job.status === "Open").slice(0, 4);
  const applicationSummary = [
    ["Applied", Math.max(applied.length, 2)],
    ["Shortlisted", 1],
    ["Hired", 1],
    ["Rejected", 1],
  ];

  return (
    <AppShell
      role="worker"
      title="Molo, Sipho 👋"
      subtitle="Gardener · Belhar Ext 13"
      action={
        <button
          onClick={toggleAvailability}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 transition-colors hover:bg-muted"
          title={available ? "Click to go offline" : "Click to go online"}
        >
          <span className="text-sm font-semibold">
            {available ? "Available for work" : "Not available"}
          </span>
          <span
            className={`relative h-7 w-12 rounded-full transition-colors ${
              available ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                available ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <button
          onClick={() => navigate({ to: "/worker/applications" })}
          className="card-surface text-left transition-colors hover:bg-muted"
        >
          <div className="p-5">
            <StatCard label="Completed jobs" value="47" hint="8 this month" icon="✅" />
          </div>
        </button>
        <button
          onClick={() => navigate({ to: "/earnings" })}
          className="card-surface text-left transition-colors hover:bg-muted"
        >
          <div className="p-5">
            <StatCard label="Total earned" value={formatCurrency(wallet.totalEarned)} hint="Available to withdraw" icon="💰" />
          </div>
        </button>
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="card-surface text-left transition-colors hover:bg-muted"
        >
          <div className="p-5">
            <StatCard label="Rating" value="4.9★" hint="From 41 reviews" icon="⭐" />
          </div>
        </button>
      </div>

      <Section
        title="Recommended for you"
        action={
          <Link to="/worker/find-jobs" className="text-sm font-semibold text-primary hover:underline">
            See all jobs
          </Link>
        }
      >
        {openJobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {openJobs.map((job) => (
              <div
                key={job.id}
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => navigate({ to: "/worker/job/$jobId", params: { jobId: job.id } })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate({ to: "/worker/job/$jobId", params: { jobId: job.id } });
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <JobCard job={job} view="worker" />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No open jobs right now. Check back soon!
          </div>
        )}
      </Section>

      <Section
        title="My applications"
        action={
          <Link to="/worker/applications" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-4">
          {applicationSummary.map(([label, n]) => (
            <button
              key={label as string}
              onClick={() => navigate({ to: "/worker/applications" })}
              className="card-surface p-5 text-left transition-colors hover:bg-muted"
            >
              <div className="font-display text-2xl font-bold">{n}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </button>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
