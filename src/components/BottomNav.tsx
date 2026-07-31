import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Play, Users, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavPath = "/home" | "/routines" | "/log" | "/coach" | "/friends" | "/profile";

const ITEMS: { to: NavPath; label: string; icon: typeof Home; center?: boolean }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/routines", label: "Plans", icon: ListChecks },
  { to: "/log", label: "Live Log", icon: Play, center: true },
  { to: "/coach", label: "Coach", icon: MessageSquare },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav({ live }: { live?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
      <div className="glass mx-auto flex max-w-lg items-stretch justify-between gap-0.5 rounded-2xl px-1.5 py-1.5">
        {ITEMS.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors",
                active ? "text-lime" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  active && "bg-primary/12",
                  item.center && live && "bg-flare/20 text-flare pulse-ring",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className="text-[9.5px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
