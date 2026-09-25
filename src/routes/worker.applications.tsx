import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Tag } from "@/components/ui-kit";
import { rand } from "@/lib/data";
import { useApplications, useJobs } from "@/lib/hooks";

export const Route = createFileRoute("/worker/applications")({
  head: () => ({
    meta: [
      { title: "My Applications — Connectly" },
      {
        name: "description",
        content: "Track jobs you've applied to, shortlists, hires and rejections on Connectly.",
      },
      { property: "og:title", content: "My Applications — Connectly" },
      { property: "og:description", content: "Every application you've sent, in one list." },
    ],
  }),
  component: MyApplications,
});

const tabs = ["Applied", "Shortlisted", "Hired", "Rejected"] as const;
type Tab = (typeof tabs)[number];

function MyApplications() {
  const [tab, setTab] = useState<Tab>("Applied");
  const { applied } = useApplications();
  const { jobs } = useJobs();

  const liveApplications: Record<Tab, Array<{ id?: string; job: string; client: string; budget: number; when: string }>> = {
    Applied: jobs
      .filter((job) => applied.includes(job.id))
      .map((job) => ({
        id: job.id,
        job: job.title,
        client: job.postedBy,
        budget: job.budget,
        when: "Applied recently",
      })),
    Shortlisted: jobs
      .filter((job) => job.status === "In Progress")
      .map((job) => ({
        id: job.id,
        job: job.title,
        client: job.postedBy,
        budget: job.budget,
        when: "Shortlisted for review",
      })),
    Hired: jobs
      .filter((job) => job.status === "Completed")
      .map((job) => ({
        id: job.id,
        job: job.title,
        client: job.postedBy,
        budget: job.budget,
        when: "Job completed",
      })),
    Rejected: [],
  };

  const list = liveApplications[tab];

  return (
    <AppShell role="worker" title="My Applications" subtitle="Where each application stands">
      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} ({liveApplications[t].length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            Nothing here yet. Your {tab.toLowerCase()} items will appear when the status changes.
          </div>
        ) : (
          list.map((a) => (
            <div
              key={a.id ?? a.job}
              className="card-surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5"
            >
              <div className="min-w-0">
                <Tag label={tab} />
                <h3 className="mt-2 truncate font-display font-bold">{a.job}</h3>
                <p className="text-xs text-muted-foreground">
                  {a.client} · {a.when}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-display text-lg font-bold text-primary">{rand(a.budget)}</div>
                {a.id ? (
                  <Link to="/worker/job/$jobId" params={{ jobId: a.id }} className="mr-3 text-xs font-semibold text-primary">
                    View job
                  </Link>
                ) : null}
                <Link to="/messages" className="text-xs font-semibold text-primary">
                  Message client
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
