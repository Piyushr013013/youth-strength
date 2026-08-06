import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Check,
  X,
  Trophy,
  Activity,
  MessageSquare,
  Ban,
  Zap,
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
import { fetchActivityFeed, HYPE_EMOJIS, toggleHype } from "@/lib/hype";
import { formatVolume, formatDuration } from "@/lib/fitness";
import { sportVisual } from "@/lib/sport-visuals";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({
    meta: [
      { title: "Teammates, Hype & Leaderboard — ATHLETE OS" },
      {
        name: "description",
        content:
          "See teammate sessions in a live activity feed, hype their workouts and filter the leaderboard by school, club team or class year.",
      },
      { property: "og:title", content: "Teammates, Hype & Leaderboard — ATHLETE OS" },
      {
        property: "og:description",
        content: "Live teammate activity feed, one-tap hype and class-year leaderboards.",
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

function Avatar({ name, accent = "lime" }: { name: string; accent?: "lime" | "cyan" | "flare" }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-black",
        accent === "lime" && "border-lime/40 bg-lime/10 text-lime",
        accent === "cyan" && "border-cyan/40 bg-cyan/10 text-cyan",
        accent === "flare" && "border-flare/40 bg-flare/10 text-flare",
      )}
    >
      {initials || "A"}
    </span>
  );
}

function FriendsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"feed" | "board" | "requests" | "find">("feed");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [metric, setMetric] = useState<"volume" | "sessions" | "streak">("volume");

  const dm = useMutation({
    mutationFn: (id: string) => openDirectChat(id),
    onSuccess: (chatId) => navigate({ to: "/messages/$chatId", params: { chatId } }),
    onError: (e: Error) => toast.error(e.message),
  });
  const block = useMutation({
    mutationFn: (id: string) => blockAthlete(user.id, id),
    onSuccess: () => {
      toast.success("Blocked — they can't text you");
      qc.invalidateQueries({ queryKey: ["blocked"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const friendships = useQuery({ queryKey: ["friendships"], queryFn: fetchFriendships });
  const board = useQuery({
    queryKey: ["friends-leaderboard"],
    queryFn: fetchFriendsLeaderboard,
    refetchInterval: 60_000,
  });
  const feed = useQuery({
    queryKey: ["activity-feed"],
    queryFn: fetchActivityFeed,
    refetchInterval: 45_000,
  });
  const search = useQuery({
    queryKey: ["athlete-search", query],
    queryFn: () => searchAthletes(query),
    enabled: query.trim().length >= 2,
  });

  const hype = useMutation({
    mutationFn: (v: { workoutId: string; emoji: string; active: boolean }) =>
      toggleHype(user.id, v.workoutId, v.emoji, v.active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity-feed"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const incoming = useMemo(
    () =>
      (friendships.data ?? []).filter((f) => f.status === "pending" && f.addressee_id === user.id),
    [friendships.data, user.id],
  );
  const outgoing = useMemo(
    () =>
      (friendships.data ?? []).filter((f) => f.status === "pending" && f.requester_id === user.id),
    [friendships.data, user.id],
  );
  const accepted = useMemo(
    () => (friendships.data ?? []).filter((f) => f.status === "accepted"),
    [friendships.data],
  );

  const pendingIds = useMemo(
    () =>
      [...incoming, ...outgoing].map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id,
      ),
    [incoming, outgoing, user.id],
  );

  const names = useQuery({
    queryKey: ["friend-profiles", pendingIds.join(",")],
    queryFn: () => fetchFriendProfiles(pendingIds),
    enabled: pendingIds.length > 0,
  });
  const nameOf = (id: string) => names.data?.find((n) => n.id === id)?.display_name ?? "Athlete";

  /** School / club / class-year filter chips built from real teammate data. */
  const filters = useMemo(() => {
    const rows = board.data ?? [];
    const out: { key: string; label: string }[] = [{ key: "all", label: "Everyone" }];
    const seen = new Set<string>();
    for (const r of rows) {
      if (r.school && !seen.has(`school:${r.school}`)) {
        seen.add(`school:${r.school}`);
        out.push({ key: `school:${r.school}`, label: r.school });
      }
      if (r.club_team && !seen.has(`club:${r.club_team}`)) {
        seen.add(`club:${r.club_team}`);
        out.push({ key: `club:${r.club_team}`, label: r.club_team });
      }
      if (r.grad_year && !seen.has(`grad:${r.grad_year}`)) {
        seen.add(`grad:${r.grad_year}`);
        out.push({ key: `grad:${r.grad_year}`, label: `Class of '${String(r.grad_year).slice(2)}'` });
      }
    }
    return out;
  }, [board.data]);

  const rankings = useMemo(() => {
    let rows = board.data ?? [];
    if (filter !== "all") {
      const [kind, value] = filter.split(":");
      rows = rows.filter((r) =>
        kind === "school"
          ? r.school === value
          : kind === "club"
            ? r.club_team === value
            : String(r.grad_year) === value,
      );
    }
    return [...rows].sort((a, b) =>
      metric === "volume"
        ? b.total_volume - a.total_volume
        : metric === "sessions"
          ? b.weekly_sessions - a.weekly_sessions
          : b.streak_days - a.streak_days,
    );
  }, [board.data, filter, metric]);

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
    <div className="mx-auto w-full max-w-md space-y-5 pb-32">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">Teammates</h1>
          <p className="text-xs text-muted-foreground">
            {accepted.length} connected · hype their sessions, climb the board
          </p>
        </div>
        <Link
          to="/messages"
          className="glow-lime flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <MessageSquare size={14} /> Messages
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={tab === "feed"} onClick={() => setTab("feed")}>
          Activity
        </Chip>
        <Chip active={tab === "board"} onClick={() => setTab("board")}>
          Leaderboard
        </Chip>
        <Chip active={tab === "requests"} onClick={() => setTab("requests")}>
          Requests{incoming.length ? ` (${incoming.length})` : ""}
        </Chip>
        <Chip active={tab === "find"} onClick={() => setTab("find")}>
          Find athletes
        </Chip>
      </div>

      {/* ── Activity feed ──────────────────────────────── */}
      {tab === "feed" ? (
        <section className="space-y-3">
          <SectionTitle>Athlete feed</SectionTitle>
          {(feed.data ?? []).map((item, i) => {
            const v = sportVisual(item.sport);
            const mine = (emoji: string) =>
              item.hypes.some((h) => h.user_id === user.id && h.emoji === emoji);
            const countOf = (emoji: string) => item.hypes.filter((h) => h.emoji === emoji).length;
            return (
              <motion.div
                key={item.workout_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <Link
                      to="/teammate/$athleteId"
                      params={{ athleteId: item.athlete_id }}
                      className="shrink-0"
                    >
                      <Avatar name={item.display_name} accent={v.accent} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <Link
                          to="/teammate/$athleteId"
                          params={{ athleteId: item.athlete_id }}
                          className="font-bold underline-offset-2 hover:underline"
                        >
                          {item.display_name}
                        </Link>{" "}
                        <span className="text-muted-foreground">just logged</span>
                      </p>
                      <p className="truncate text-sm font-semibold text-lime">
                        {v.emoji} {item.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {ago(item.started_at)}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-lg bg-surface-2/70 px-2 py-1">
                      {formatDuration(item.duration_sec)}
                    </span>
                    <span className="rounded-lg bg-surface-2/70 px-2 py-1">
                      {item.total_sets} sets
                    </span>
                    <span className="rounded-lg bg-surface-2/70 px-2 py-1 text-lime">
                      {formatVolume(item.total_volume)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {HYPE_EMOJIS.map((e) => {
                      const active = mine(e);
                      const count = countOf(e);
                      return (
                        <motion.button
                          key={e}
                          whileTap={{ scale: 1.35 }}
                          onClick={() =>
                            hype.mutate({ workoutId: item.workout_id, emoji: e, active })
                          }
                          aria-label={`React ${e}`}
                          className={cn(
                            "flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition",
                            active
                              ? "border-lime/60 bg-lime/15 text-lime"
                              : "border-border bg-surface-2/60 text-muted-foreground",
                          )}
                        >
                          <span>{e}</span>
                          {count ? <span className="text-[11px] font-bold">{count}</span> : null}
                        </motion.button>
                      );
                    })}
                    <button
                      onClick={() => dm.mutate(item.athlete_id)}
                      className="ml-auto flex items-center gap-1 rounded-full border border-cyan/40 px-2.5 py-1 text-[11px] font-bold text-cyan"
                    >
                      <MessageSquare size={12} /> Text
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
          {!feed.data?.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              No teammate sessions yet. Add athletes and their workouts show up here live.
            </GlassCard>
          ) : null}
        </section>
      ) : null}

      {/* ── Leaderboard ────────────────────────────────── */}
      {tab === "board" ? (
        <section>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {(
              [
                { key: "volume", label: "30-Day Volume" },
                { key: "sessions", label: "Weekly Sessions" },
                { key: "streak", label: "Current Streak" },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-[11px] font-bold leading-tight transition",
                  metric === m.key
                    ? "glow-lime border-lime/60 bg-lime/15 text-lime"
                    : "border-border bg-surface-2/60 text-muted-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <SectionTitle>
            {metric === "volume"
              ? "30-day volume"
              : metric === "sessions"
                ? "Sessions this week"
                : "Current streak"}
          </SectionTitle>
          <div className="space-y-2">
            {rankings.map((f, i) => {
              const live = f.last_workout
                ? Date.now() - new Date(f.last_workout).getTime() < 3 * 60_000
                : false;
              return (
                <GlassCard
                  key={f.id}
                  className="flex items-center gap-3 p-4"
                  glow={i < 3 ? (i === 0 ? "lime" : "cyan") : null}
                >
                  <span
                    className={cn(
                      "font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black",
                      i === 0 && "glow-lime border-lime/70 bg-lime/20 text-lime",
                      i === 1 && "glow-cyan border-cyan/70 bg-cyan/15 text-cyan",
                      i === 2 && "glow-flare border-flare/70 bg-flare/15 text-flare",
                      i > 2 && "border-transparent text-muted-foreground",
                    )}
                  >
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                  </span>
                  <Avatar name={f.display_name} accent={sportVisual(f.sport).accent} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {f.display_name}
                      {f.id === user.id ? " (you)" : ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {f.school ?? f.club_team ?? f.sport ?? "Athlete"}
                      {f.grad_year ? ` · '${String(f.grad_year).slice(2)}` : ""} ·{" "}
                      {f.workout_count} sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-lime">
                      {metric === "volume"
                        ? formatVolume(f.total_volume)
                        : metric === "sessions"
                          ? `${f.weekly_sessions} this wk`
                          : `${f.streak_days}d 🔥`}
                    </p>
                    <p
                      className={
                        live
                          ? "flex items-center justify-end gap-1 text-[11px] font-semibold text-flare"
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
            {!rankings.length ? (
              <GlassCard className="p-5 text-sm text-muted-foreground">
                Nobody in this group yet.
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
                    <GlassCard key={f.id} className="flex items-center gap-2.5 p-4">
                      <Trophy size={16} className="shrink-0 text-cyan" />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {stat?.display_name ?? nameOf(otherId)}
                      </p>
                      <button
                        onClick={() => dm.mutate(otherId)}
                        aria-label="Message athlete"
                        className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground"
                      >
                        <MessageSquare size={13} /> Chat
                      </button>
                      <button
                        onClick={() => block.mutate(otherId)}
                        aria-label="Block athlete"
                        className="rounded-lg border border-border px-2 py-1.5 text-muted-foreground"
                      >
                        <Ban size={13} />
                      </button>
                      <button
                        onClick={() => remove.mutate(f.id)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground"
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
                  <Avatar name={nameOf(f.requester_id)} accent="cyan" />
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {nameOf(f.requester_id)}
                  </p>
                  <button
                    onClick={() => respond.mutate({ id: f.id, status: "accepted" })}
                    aria-label="Accept request"
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => respond.mutate({ id: f.id, status: "declined" })}
                    aria-label="Decline request"
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
                <GlassCard className="p-5 text-sm text-muted-foreground">Nothing pending.</GlassCard>
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
              placeholder="Search by name, school or sport…"
              className="w-full rounded-xl border border-border bg-surface-2/70 py-3 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>
          {query.trim().length < 2 ? (
            <p className="text-xs text-muted-foreground">
              Type at least 2 characters — name, school, club team or sport track.
            </p>
          ) : null}
          <div className="space-y-2">
            {(search.data ?? []).map((a) => (
              <GlassCard key={a.id} className="flex items-center gap-3 p-4">
                <Avatar name={a.display_name} accent={sportVisual(a.sport).accent} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.display_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[a.sport, a.school ?? a.club_team].filter(Boolean).join(" · ") || "Athlete"}
                  </p>
                </div>
                {alreadyLinked(a.id) ? (
                  <span className="text-xs text-muted-foreground">Linked</span>
                ) : (
                  <button
                    onClick={() => add.mutate(a.id)}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    <UserPlus size={13} /> Add Teammate
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

      <p className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground">
        <Zap size={12} className="text-lime" /> Hype updates every 45 seconds
      </p>
    </div>
  );
}
