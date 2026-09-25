import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Stars, Tag } from "@/components/ui-kit";
import { reviews } from "@/lib/data";
import { toast } from "sonner";
import { useProfile, useSignOut } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Connectly" },
      {
        name: "description",
        content: "Your Connectly profile: skills, rating, reviews and account settings.",
      },
      { property: "og:title", content: "My Profile — Connectly" },
      { property: "og:description", content: "Manage your Connectly profile and reviews." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const signOut = useSignOut();
  const { profile } = useProfile();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.full_name ?? "Your name",
    about: "I've been doing garden and general maintenance work around Belhar and Bellville South for eight years. I bring my own tools, I'm on time, and I clean up properly before I leave. Available Monday to Saturday.",
  });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    if (profile?.full_name) {
      setEditData((current) => ({ ...current, name: profile.full_name ?? current.name }));
    }
  }, [profile?.full_name]);

  const handleSaveProfile = () => {
    if (!editData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editData.about.length < 10) {
      toast.error("About section must be at least 10 characters");
      return;
    }
    toast.success("Profile updated successfully");
    setShowEditProfile(false);
  };

  const handleChangePassword = () => {
    if (!password.current.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (!password.new.trim()) {
      toast.error("New password is required");
      return;
    }
    if (password.new.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (password.new !== password.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed successfully");
    setPassword({ current: "", new: "", confirm: "" });
    setShowPasswordChange(false);
  };

  return (
    <AppShell role="worker" title="My Profile" subtitle="How the community sees you">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="card-surface p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-accent font-display text-2xl font-bold text-primary">
                SM
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold">{editData.name}</h2>
                <p className="text-sm text-muted-foreground">Gardener · Belhar Ext 13</p>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <Stars rating={4.9} />
                  <span className="text-muted-foreground">47 jobs completed</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Gardener", "Handyman", "Painter"].map((s) => (
                <Tag key={s} label={s} className="bg-accent text-primary" />
              ))}
              <Tag label="Intermediate" className="bg-muted text-muted-foreground" />
            </div>
            <h3 className="mt-6 font-display font-bold">About me</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {editData.about}
            </p>
          </div>

          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Reviews ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.name} className="card-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-secondary">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">"{r.text}"</p>
                  <p className="mt-2 text-xs text-muted-foreground">{r.date}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="card-surface h-fit p-5">
          <h3 className="font-display font-bold">Settings</h3>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setShowEditProfile(true)}
              className="btn-secondary w-full"
              title="Edit your profile information"
            >
              Edit profile
            </button>
            <button
              onClick={() => setShowPasswordChange(true)}
              className="btn-secondary w-full"
              title="Change your password"
            >
              Change password
            </button>
            <Link to="/notifications" className="btn-ghost w-full">
              Notifications
            </Link>
            <Link to="/settings" className="btn-ghost w-full">
              Language & settings
            </Link>
            <button onClick={signOut} className="btn-ghost w-full !text-destructive">
              Log out
            </button>
          </div>
        </aside>

        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card-surface max-w-md space-y-4 p-6">
              <h3 className="font-display text-lg font-bold">Edit Profile</h3>
              <label>
                <span className="mb-1 block text-sm font-semibold">Name</span>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="field"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold">About</span>
                <textarea
                  rows={4}
                  maxLength={200}
                  value={editData.about}
                  onChange={(e) => setEditData({ ...editData, about: e.target.value })}
                  className="field"
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                  {editData.about.length}/200
                </span>
              </label>
              <div className="flex gap-3">
                <button onClick={handleSaveProfile} className="btn-primary flex-1">
                  Save
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card-surface max-w-md space-y-4 p-6">
              <h3 className="font-display text-lg font-bold">Change Password</h3>
              <label>
                <span className="mb-1 block text-sm font-semibold">Current Password</span>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  className="field"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold">New Password</span>
                <input
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  className="field"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold">Confirm Password</span>
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  className="field"
                />
              </label>
              <div className="flex gap-3">
                <button onClick={handleChangePassword} className="btn-primary flex-1">
                  Change
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPassword({ current: "", new: "", confirm: "" });
                  }}
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
