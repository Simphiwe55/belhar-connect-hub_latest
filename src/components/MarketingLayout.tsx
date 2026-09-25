import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/about" className="btn-ghost hidden sm:inline-flex">
            How it works
          </Link>
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary !h-10 !px-4 !text-sm">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Connect. Hire. Earn. A community job marketplace built for Belhar, Cape Town — helping
            neighbours find trusted help and local workers find steady income.
          </p>
        </div>
        <FooterCol
          title="For Community Members"
          links={[
            ["Post a job", "/member/post-job"],
            ["My jobs", "/member/jobs"],
            ["Member dashboard", "/member/dashboard"],
          ]}
        />
        <FooterCol
          title="For Workers"
          links={[
            ["Find jobs", "/signup"],
            ["My applications", "/signup"],
            ["Earnings", "/signup"],
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            ["Contact", "/contact"],
            ["How it works", "/about"],
            ["Log in", "/login"],
          ]}
        />
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 Connectly · Belhar, Cape Town
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
