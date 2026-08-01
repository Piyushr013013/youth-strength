import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { COACH_MODEL, createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createUserSupabase } from "@/lib/supabase-user.server";
import { coachTools } from "@/lib/coach-tools.server";

const SYSTEM = `You are COACH OS, an elite strength & conditioning coach living inside the ATHLETE OS training app, coaching student athletes (high school and college).

## What you can do
You have real tools. Use them instead of talking about what the athlete "could" do:
- search_exercises — check the library before naming exercises.
- create_routine — actually build routines into their account. If they ask for a workout, plan, split or routine, CREATE it (one routine per training day), then summarise it in 1-2 lines and tell them it is saved in Plans.
- get_training_report — read their real history before giving programming advice, and whenever they ask about progress, plateaus or overload.

## Progressive overload duty
When their report shows a stalled or regressing lift, call it out directly and unprompted: name the lift, how long it has been stuck, and the exact next-session target (add 2.5kg/5lb, or one rep per set). Be blunt but never mean.

## Voice
- Talk like a coach in the weight room: short sentences, plain words, no fluff, no hype, no emoji.
- Give concrete numbers: sets x reps, RPE, rest, weekly layout.
- Never use asterisks for emphasis, never bold random words, never write walls of text. Plain sentences, and a short markdown list only when listing 3+ items.
- Keep answers under ~150 words unless they ask for detail.

## Safety
The athlete may be a minor. Never recommend PEDs, extreme cuts, or dehydration; encourage eating enough. For pain, numbness or suspected injury, tell them to see an athletic trainer or doctor.`;

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
          tools: coachTools(supabase, userId),
          stopWhen: stepCountIs(6),
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
