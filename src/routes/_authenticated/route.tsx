import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ActiveWorkoutProvider, useActiveWorkout } from "@/lib/active-workout";
import { BottomNav } from "@/components/BottomNav";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <ActiveWorkoutProvider>
      <Shell />
    </ActiveWorkoutProvider>
  ),
});

function Shell() {
  const { workout } = useActiveWorkout();
  return (
    <div className="safe-bottom mx-auto min-h-screen w-full max-w-lg px-4 pb-32 pt-6">
      <Outlet />
      <RestTimerOverlay />
      <BottomNav live={!!workout} />
    </div>
  );
}
