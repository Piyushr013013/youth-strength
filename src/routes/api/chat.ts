import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { COACH_MODEL, createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createUserSupabase } from "@/lib/supabase-user.server";

const SYSTEM = `You are COACH OS, an elite strength & conditioning coach for student athletes (high school and college).
You give direct, practical, evidence-based answers about training, programming, sport-specific performance, recovery, sleep, nutrition and injury-risk reduction.
Rules:
- Be concise and concrete. Prefer sets x reps, RPE, weekly structure and simple progressions.
- Respect that the athlete may be a minor: never recommend PEDs, extreme cuts, or dangerous dehydration. Encourage eating enough.
- For pain, numbness, or suspected injury, say clearly to see an athletic trainer / doctor.
- Reference the athlete's sport and schedule (practice, games, in-season vs off-season) when relevant.
- Use short markdown: bold labels, short bullets. No long essays.`;

type Body = { messages?: unknown; threadId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI is not configured", { status: 500 });

        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as Body;
        const messages = body.messages;
        const threadId = typeof body.threadId === "string" ? body.threadId : null;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("messages and threadId are required", { status: 400 });
        }

        const supabase = createUserSupabase(token);
        const { data: userData } = await supabase.auth.getUser(token);
        const userId = userData.user?.id;
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const { data: thread, error: threadError } = await supabase
          .from("coach_threads")
          .select("id")
          .eq("id", threadId)
          .maybeSingle();
        if (threadError) return new Response(threadError.message, { status: 400 });
        if (!thread) return new Response("Thread not found", { status: 404 });

        const uiMessages = messages as UIMessage[];
        const last = uiMessages[uiMessages.length - 1];
        if (last?.role === "user") {
          const { error } = await supabase.from("coach_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            message: last as never,
          });
          if (error) console.error("[coach] failed to save user message", error.message);
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(COACH_MODEL),
          system: SYSTEM,
          messages: await convertToModelMessages(uiMessages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ responseMessage }) => {
            const { error } = await supabase.from("coach_messages").insert({
              thread_id: threadId,
              user_id: userId,
              role: "assistant",
              message: responseMessage as never,
            });
            if (error) console.error("[coach] failed to save assistant message", error.message);
            await supabase
              .from("coach_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
