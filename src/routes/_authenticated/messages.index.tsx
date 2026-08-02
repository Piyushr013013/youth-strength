import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  Check,
  MessageSquarePlus,
  Users,
  UserRoundX,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle, Chip } from "@/components/ui-kit";
import {
  blockAthlete,
  chatTitle,
  createGroupChat,
  fetchBlocked,
  fetchChats,
  openDirectChat,
  unblockAthlete,
} from "@/lib/messaging";
import { fetchFriendProfiles, fetchFriendships } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — ATHLETE OS" },
      {
        name: "description",
        content:
          "Direct message teammates, start group chats for your squad and manage blocked athletes.",
      },
      { property: "og:title", content: "Messages — ATHLETE OS" },
      {
        property: "og:description",
        content: "Team chat built into your training app: DMs, group chats and blocking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesIndex,
});

function when(iso: string | null) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MessagesIndex() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"inbox" | "new" | "blocked">("inbox");
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const chats = useQuery({
    queryKey: ["chats", user.id],
    queryFn: () => fetchChats(user.id),
    refetchInterval: 20_000,
  });
  const friendships = useQuery({ queryKey: ["friendships"], queryFn: fetchFriendships });
  const blocked = useQuery({ queryKey: ["blocked"], queryFn: fetchBlocked });

  const friendIds = useMemo(
    () =>
      (friendships.data ?? [])
        .filter((f) => f.status === "accepted")
        .map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id)),
    [friendships.data, user.id],
  );
  const blockedIds = useMemo(
    () => new Set((blocked.data ?? []).map((b) => b.blocked_id)),
    [blocked.data],
  );

  const profiles = useQuery({
    queryKey: ["friend-profiles", friendIds.join(",")],
    queryFn: () => fetchFriendProfiles(friendIds),
    enabled: friendIds.length > 0,
  });
  const nameOf = (id: string) =>
    profiles.data?.find((p) => p.id === id)?.display_name ?? "Athlete";

  const openDm = useMutation({
    mutationFn: (id: string) => openDirectChat(id),
    onSuccess: (chatId) => {
      qc.invalidateQueries({ queryKey: ["chats"] });
      navigate({ to: "/messages/$chatId", params: { chatId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const makeGroup = useMutation({
    mutationFn: () => createGroupChat(user.id, groupName.trim() || "Squad", picked),
    onSuccess: (chatId) => {
      setGroupMode(false);
      setGroupName("");
      setPicked([]);
      qc.invalidateQueries({ queryKey: ["chats"] });
      navigate({ to: "/messages/$chatId", params: { chatId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const block = useMutation({
    mutationFn: (id: string) => blockAthlete(user.id, id),
    onSuccess: () => {
      toast.success("Blocked");
      qc.invalidateQueries({ queryKey: ["blocked"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const unblock = useMutation({
    mutationFn: (id: string) => unblockAthlete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blocked"] }),
  });

  return (
    <div className="space-y-5 pb-32">
      <div className="flex items-center gap-3">
        <Link
          to="/friends"
          className="rounded-xl border border-border p-2 text-muted-foreground"
          aria-label="Back to friends"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">Messages</h1>
          <p className="text-xs text-muted-foreground">
            {chats.data?.length ?? 0} conversations · DMs and squad group chats
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={tab === "inbox"} onClick={() => setTab("inbox")}>
          Inbox
        </Chip>
        <Chip active={tab === "new"} onClick={() => setTab("new")}>
          New chat
        </Chip>
        <Chip active={tab === "blocked"} onClick={() => setTab("blocked")}>
          Blocked{blockedIds.size ? ` (${blockedIds.size})` : ""}
        </Chip>
      </div>

      {tab === "inbox" ? (
        <section className="space-y-2">
          {chats.isLoading ? (
            <GlassCard className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading conversations…
            </GlassCard>
          ) : null}
          {(chats.data ?? []).map((c) => {
            const title = chatTitle(c, user.id);
            return (
              <Link key={c.id} to="/messages/$chatId" params={{ chatId: c.id }}>
                <GlassCard className="flex items-center gap-3 p-4">
                  <span
                    className={
                      c.is_group
                        ? "font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan/15 text-xs font-bold text-cyan"
                        : "font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-lime"
                    }
                  >
                    {c.is_group ? <Users size={18} /> : initials(title)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.lastMessage ?? "No messages yet — say something"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {when(c.lastAt)}
                  </span>
                </GlassCard>
              </Link>
            );
          })}
          {!chats.isLoading && !chats.data?.length ? (
            <GlassCard className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">
                No conversations yet. Start one with a teammate.
              </p>
              <button
                onClick={() => setTab("new")}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
              >
                <MessageSquarePlus size={15} /> New chat
              </button>
            </GlassCard>
          ) : null}
        </section>
      ) : null}

      {tab === "new" ? (
        <section className="space-y-3">
          <div className="flex gap-2">
            <Chip active={!groupMode} onClick={() => setGroupMode(false)}>
              Direct
            </Chip>
            <Chip active={groupMode} onClick={() => setGroupMode(true)}>
              Group
            </Chip>
          </div>

          {groupMode ? (
            <GlassCard className="space-y-3 p-4">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (e.g. Varsity Lifting)"
                className="w-full rounded-xl border border-border bg-surface-2/70 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
              />
              <p className="text-xs text-muted-foreground">
                {picked.length} selected · tap teammates below
              </p>
              <button
                disabled={!picked.length || makeGroup.isPending}
                onClick={() => makeGroup.mutate()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                {makeGroup.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Users size={15} />
                )}
                Create group chat
              </button>
            </GlassCard>
          ) : null}

          <SectionTitle>Your connections</SectionTitle>
          <div className="space-y-2">
            {friendIds
              .filter((id) => !blockedIds.has(id))
              .map((id) => {
                const on = picked.includes(id);
                return (
                  <GlassCard key={id} className="flex items-center gap-3 p-4">
                    <span className="font-display flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-lime">
                      {initials(nameOf(id))}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{nameOf(id)}</p>
                    {groupMode ? (
                      <button
                        onClick={() =>
                          setPicked((p) => (on ? p.filter((x) => x !== id) : [...p, id]))
                        }
                        className={
                          on
                            ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                            : "rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
                        }
                      >
                        {on ? <Check size={14} /> : "Add"}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDm.mutate(id)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => block.mutate(id)}
                          aria-label={`Block ${nameOf(id)}`}
                          className="rounded-lg border border-border px-2.5 py-1.5 text-muted-foreground"
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            {!friendIds.length ? (
              <GlassCard className="space-y-3 p-5">
                <p className="text-sm text-muted-foreground">
                  Add teammates first, then you can text them here.
                </p>
                <Link
                  to="/friends"
                  className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  Find athletes
                </Link>
              </GlassCard>
            ) : null}
          </div>
        </section>
      ) : null}

      {tab === "blocked" ? (
        <section className="space-y-2">
          {(blocked.data ?? []).map((b) => (
            <GlassCard key={b.id} className="flex items-center gap-3 p-4">
              <UserRoundX size={16} className="text-flare" />
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                {nameOf(b.blocked_id)}
              </p>
              <button
                onClick={() => unblock.mutate(b.id)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
              >
                Unblock
              </button>
            </GlassCard>
          ))}
          {!blocked.data?.length ? (
            <GlassCard className="p-5 text-sm text-muted-foreground">
              Nobody blocked. Blocked athletes can't text you.
            </GlassCard>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
