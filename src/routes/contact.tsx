import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { toast } from "sonner";
import { recordEvent } from "@/lib/tracking";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Connectly" },
      {
        name: "description",
        content: "Contact the Connectly support team about jobs, account issues, or general help.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const mailtoLink = useMemo(() => {
    const body = [
      `Name: ${form.name || "Not provided"}`,
      `Email: ${form.email || "Not provided"}`,
      "",
      `Message:\n${form.message || ""}`,
    ].join("\n");

    return `mailto:hello@connectly.co.za?subject=${encodeURIComponent(
      form.subject || "Connectly enquiry",
    )}&body=${encodeURIComponent(body)}`;
  }, [form]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name || !email || !subject || !message) {
      toast.error("Please complete all fields before sending your message.");
      return;
    }

    const ticketId = `CN-${Date.now().toString().slice(-8)}`;
    recordEvent("contact_submission", {
      id: ticketId,
      name,
      email,
      subject,
      messageLength: message.length,
    });

    const records = JSON.parse(window.localStorage.getItem("connectly:contact") ?? "[]");
    records.unshift({
      id: ticketId,
      createdAt: new Date().toISOString(),
      name,
      email,
      subject,
      status: "New",
    });
    window.localStorage.setItem("connectly:contact", JSON.stringify(records.slice(0, 20)));

    setReference(ticketId);
    setIsSubmitted(true);
    toast.success("Message sent successfully. We’ll reply to your email soon.");

    if (typeof window !== "undefined") {
      window.location.href = mailtoLink;
    }
  }

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-surface p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Contact us
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold">We’re here to help</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Reach out about a job issue, account access, payments, or anything else in the Connectly app.
            </p>

            {isSubmitted ? (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Your message was recorded successfully. Reference: <strong>{reference}</strong>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold">Your name</span>
                    <input
                      className="field"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Your full name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold">Email</span>
                    <input
                      className="field"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="you@example.co.za"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Subject</span>
                  <input
                    className="field"
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                    placeholder="Account issue, payment, support request"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Message</span>
                  <textarea
                    className="field min-h-[140px] resize-y"
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Tell us what you need help with..."
                  />
                </label>

                <button type="submit" className="btn-primary w-full">
                  Send message
                </button>
              </form>
            )}
          </div>

          <div className="card-surface p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">Support details</h2>
            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a href="mailto:hello@connectly.co.za" className="text-primary hover:underline">
                  hello@connectly.co.za
                </a>
              </div>
              <div>
                <p className="font-semibold text-foreground">Hours</p>
                <p>Monday to Friday · 08:00–17:00</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Response</p>
                <p>We usually get back to you within one business day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
