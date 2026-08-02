import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  UserPlus,
  Check,
  X,
  Trophy,
  Activity,
  MessageSquare,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle, Chip } from "@/components/ui-kit";
import {
  fetchFriendProfiles,
  fetchFriendships,
  fetchFriendsLeaderboard,
  removeFriendship,
  respondToRequest,
  searchAthletes,
  sendFriendRequest,
} from "@/lib/social";
import { blockAthlete, openDirectChat } from "@/lib/messaging";
import { formatVolume } from "@/lib/fitness";


export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({
    meta: [
      { title: "Friends & Leaderboard — ATHLETE OS" },
      {
        name: "description",
        content:
          "Connect with teammates, see who trained today and compare 30-day volume on the friends leaderboard.",
      },
      { property: "og:title", content: "Friends & Leaderboard — ATHLETE OS" },
      {
        property: "og:description",
        content: "Connect with teammates and see who's training right now.",
      },
    ],
  }),
  component: FriendsPage,
});

function ago(iso: string | null) {
  if (!iso) return "No sessions yet";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 3) return "Training now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function FriendsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"feed" | "requests" | "find">("feed");
  const [query, setQuery] = useState("");

  const friendships = useQuery({ queryKey: ["friendships"], queryFn: fetchFriendships });
  const board = useQuery({
    queryKey: ["friends-leaderboard"],
    queryFn: fetchFriendsLeaderboard,
    refetchInterval: 60_000,
  });
  const search = useQuery({
    queryKey: ["athlete-search", query],
    queryFn: () => searchAthletes(query),
    enabled: query.trim().length >= 2,
  });

  const incoming = useMemo(
    () => (friendships.data ?? []).filter((f) => f.status === "pending" && f.addressee_id === user.id),
    [friendships.data, user.id],
  );
  const outgoing = useMemo(
    () => (friendships.data ?? []).filter((f) => f.status === "pending" && f.requester_id === user.id),
    [friendships.data, user.id],
  );
  const accepted = useMemo(
    () => (friendships.data ?? []).filter((f) => f.status === "accepted"),
    [friendships.data],
  );

  const pendingIds = useMemo(
    () => [...incoming, ...outgoing].map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id)),
    [incoming, outgoing, user.id],
  );

  const names = useQuery({
    queryKey: ["friend-profiles", pendingIds.join(",")],
    queryFn: () => fetchFriendProfiles(pendingIds),
    enabled: pendingIds.length > 0,
  });
  const nameOf = (id: string) =>
    names.data?.find((n) => n.id === id)?.display_name ?? "Athlete";

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["friendships"] });
    qc.invalidateQueries({ queryKey: ["friends-leaderboard"] });
  };

  const add = useMutation({
    mutationFn: (id: string) => sendFriendRequest(user.id, id),
    onSuccess: () => {
      toast.success("Request sent");
      invalidate();
    },
    onError: () => toast.error("Couldn't send that request"),
  });
  const respond = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "declined" }) =>
      respondToRequest(id, status),
    onSuccess: () => invalidate(),
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeFriendship(id),
    onSuccess: () => {
      toast.success("Removed");
      invalidate();
    },
  });

  const alreadyLinked = (id: string) =>
    (friendships.data ?? []).some((f) => f.requester_id === id || f.addressee_id === id);

  return (
    <div className="space-y-5 pb-32">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">Friends</h1>
          <p className="text-xs text-muted-foreground">
            {accepted.length} connected · see who's training and compare 30-day volume
          </p>
        </div>
        <Link
          to="/messages"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <MessageSquare size={14} /> Messages
        </Link>
      </div>


      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={tab === "feed"} onClick={() => setTab("feed")}>
          Activity
        </Chip>
        <Chip active={tab === "requests"} onClick={() => setTab("requests")}>
          Requests{incoming.length ? ` (${incoming.length})` : ""}
        </Chip>
        <Chip active={tab === "find"} onClick={() => setTab("find")}>
          Find athletes
        </Chip>
      </div>

      {tab === "feed" ? (
        <section>
          <SectionTitle>30-day leaderboard</SectionTitle>
          <div className="space-y-2">
            {(board.data ?? []).map((f, i) => {
              const live = f.last_workout
                ? Date.now() - new Date(f.last_workout).getTime() < 3 * 60_000
                : false;
              return (
                <GlassCard key={f.id} className="flex items-center gap-3 p-4" glow={i === 0 ? "lime" : null}>
                  <span className="font-display w-6 text-center text-sm font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {f.display_name}
                      {f.id === user.id ? " (you)" : ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {f.sport ?? "Athlete"} · {f.workout_count} sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-lime">
                      {formatVolume(f.total_volume)}
                    </p>
                    <p
                      className={
                        live
                          ? "flex items-center gap-1 text-[11px] font-semibold text-flare"
                          : "text-[11px] text-muted-foreground"
                      }
                    >
                      {live ? <Activity size={11} /> : null}
                      {ago(f.last_workout)}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
            {!board.data?.length ? (
              <GlassCard className="p-5 text-sm text-muted-foreground">
                Add teammates to see their sessions here.
              </GlassCard>
            ) : null}
          </div>

          {accepted.length ? (
            <div className="mt-6">
              <SectionTitle>Connections</SectionTitle>
              <div className="space-y-2">
                {accepted.map((f) => {
                  const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
                  const stat = board.data?.find((b) => b.id === otherId);
                  return (
                    <GlassCard key={f.id} className="flex items-center gap-3 p-4">
                      <Trophy size={16} className="text-cyan" />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {stat?.display_name ?? nameOf(otherId)}
                      </p>
                      <button
                        onClick={() => remove.mutate(f.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        Remove
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "requests" ? (
        <section className="space-y-6">
          <div>
            <SectionTitle>Incoming</SectionTitle>
            <div className="space-y-2">
              {incoming.map((f) => (
                <GlassCard key={f.id} className="flex items-center gap-3 p-4">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {nameOf(f.requester_id)}
                  </p>
                  <button
                    onClick={() => respond.mutate({ id: f.id, status: "accepted" })}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => respond.mutate({ id: f.id, status: "declined" })}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                </GlassCard>
              ))}
              {!incoming.length ? (
                <GlassCard className="p-5 text-sm text-muted-foreground">
                  No incoming requests.
                </GlassCard>
              ) : null}
            </div>
          </div>
          <div>
            <SectionTitle>Sent</SectionTitle>
            <div className="space-y-2">
              {outgoing.map((f) => (
                <GlassCard key={f.id} className="flex items-center gap-3 p-4">
                  <p className="min-w-0 flex-1 truncate text-sm">{nameOf(f.addressee_id)}</p>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </GlassCard>
              ))}
              {!outgoing.length ? (
                <GlassCard className="p-5 text-sm text-muted-foreground">
                  Nothing pending.
                </GlassCard>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "find" ? (
        <section className="space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search athletes by name…"
              className="w-full rounded-xl border border-border bg-surface-2/70 py-3 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>
          {query.trim().length < 2 ? (
            <p className="text-xs text-muted-foreground">Type at least 2 characters.</p>
          ) : null}
          <div className="space-y-2">
            {(search.data ?? []).map((a) => (
              <GlassCard key={a.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.display_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.sport ?? "Athlete"}</p>
                </div>
                {alreadyLinked(a.id) ? (
                  <span className="text-xs text-muted-foreground">Linked</span>
                ) : (
                  <button
                    onClick={() => add.mutate(a.id)}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    <UserPlus size={13} /> Add
                  </button>
                )}
              </GlassCard>
            ))}
            {query.trim().length >= 2 && !search.isLoading && !search.data?.length ? (
              <GlassCard className="p-5 text-sm text-muted-foreground">
                No athletes match that name.
              </GlassCard>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
