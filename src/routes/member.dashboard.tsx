import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { JobCard, StatCard, Section } from "@/components/ui-kit";
import { categories, categoryEmoji, jobs, type Job } from "@/lib/data";

const initialJobs = jobs;
const statuses = ["All", "Open", "In Progress", "Completed"] as const;
const sortOptions = ["newest", "budget-desc", "budget-asc"] as const;

export const Route = createFileRoute("/member/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard — Connectly" },
      {
        name: "description",
        content: "Track your posted jobs, active hires and applicants on Connectly.",
      },
      { property: "og:title", content: "Member Dashboard — Connectly" },
      { property: "og:description", content: "Manage your Belhar job posts in one place." },
    ],
  }),
  component: MemberDashboard,
});

function MemberDashboard() {
  const [jobsList, setJobsList] = useState(initialJobs);
  const [cat, setCat] = useState<string>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("newest");

  const totalJobs = useMemo(() => jobsList.length, [jobsList]);
  const activeJobs = useMemo(
    () => jobsList.filter((job) => job.status === "Open" || job.status === "In Progress").length,
    [jobsList],
  );
  const hiredJobs = useMemo(
    () => jobsList.filter((job) => job.status === "Completed").length,
    [jobsList],
  );
  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = jobsList.filter((job) => {
      const matchesCategory = cat === "All" || job.category === cat;
      const matchesStatus = status === "All" || job.status === status;
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      return matchesCategory && matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "budget-desc") return Number(b.budget) - Number(a.budget);
      if (sortBy === "budget-asc") return Number(a.budget) - Number(b.budget);
      return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
    });
  }, [cat, jobsList, searchQuery, sortBy, status]);

  const handleDeleteJob = (id: Job["id"]) => {
    setJobsList((currentJobs) => currentJobs.filter((job) => job.id !== id));
  };

  const handleStatusChange = (id: Job["id"], nextStatus: Job["status"]) => {
    setJobsList((currentJobs) =>
      currentJobs.map((job) => (job.id === id ? { ...job, status: nextStatus } : job)),
    );
  };

  return (
    <AppShell
      role="member"
      title="Goeie dag, Fatima 👋"
      subtitle="Belhar Ext 15, Cape Town"
      action={
        <Link to="/member/post-job" className="btn-primary">
          ➕ Post a New Job
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Jobs posted" value={String(totalJobs)} hint="Since March 2026" icon="📋" />
        <StatCard label="Active jobs" value={String(activeJobs)} hint="Open or in progress" icon="⏳" />
        <StatCard label="Workers hired" value={String(hiredJobs)} hint="Completed jobs" icon="🤝" />
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title or location"
            className="input min-w-0 flex-1"
            aria-label="Search jobs"
          />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number])}
            className="input w-auto"
            aria-label="Sort jobs"
          >
            <option value="newest">Newest</option>
            <option value="budget-desc">Budget: high to low</option>
            <option value="budget-asc">Budget: low to high</option>
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...categories].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`pill shrink-0 border ${cat === c ? "border-primary bg-accent text-primary" : "border-border bg-surface text-muted-foreground"}`}>
              {c === "All" ? "All jobs" : `${categoryEmoji[c]} ${c}`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((value) => (
            <button key={value} onClick={() => setStatus(value)} className={`pill shrink-0 border ${status === value ? "border-primary bg-accent text-primary" : "border-border bg-surface text-muted-foreground"}`}>
              {value === "All" ? "All statuses" : value}
            </button>
          ))}
        </div>
      </div>

      <Section
        title="Your recent job posts"
        action={
          <Link to="/member/jobs" className="text-sm font-semibold text-primary">
            View all
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredJobs.map((j) => (
            <div key={j.id} className="space-y-2">
              <JobCard job={j} view="member" />
              {j.status === "Open" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="pill border border-border bg-surface text-muted-foreground">
                    {j.applicants?.length ?? 0} applicants
                  </span>
                  {(j.applicants?.length ?? 0) > 0 && (
                    <Link to="/member/job/$jobId" params={{ jobId: String(j.id) }} className="btn-primary">
                      Review Applicants
                    </Link>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <select value={j.status} onChange={(event) => handleStatusChange(j.id, event.target.value as Job["status"])} className="input">
                  {statuses.slice(1).map((value) => <option key={value}>{value}</option>)}
                </select>
                <button onClick={() => handleDeleteJob(j.id)} className="text-sm text-destructive">Delete</button>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && (
            <p className="text-sm text-muted-foreground">No jobs in this category yet.</p>
          )}
        </div>
      </Section>
    </AppShell>
  );
}
