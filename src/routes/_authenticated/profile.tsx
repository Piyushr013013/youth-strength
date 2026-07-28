import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — ATHLETE OS" },
      { name: "description", content: "Manage your athlete profile and tracks." },
      { property: "og:title", content: "Your Profile — ATHLETE OS" },
      { property: "og:description", content: "Manage your athlete profile and tracks." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(user.id) });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <GlassCard className="p-5">
        <p className="text-sm font-semibold">{profile.data?.display_name ?? "Athlete"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        {profile.data?.sport ? (
          <p className="mt-2 text-xs text-cyan">{profile.data.sport}</p>
        ) : null}
      </GlassCard>
      <button
        onClick={signOut}
        className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-flare"
      >
        Sign out
      </button>
    </div>
  );
}
